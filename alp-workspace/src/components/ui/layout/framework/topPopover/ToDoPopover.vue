<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <ListTodo class="w-5 h-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <div class="flex justify-between items-center mb-4">
        <div class="space-y-2 flex-grow">
          <h4 class="font-medium leading-none">To Do</h4>
          <p class="text-sm text-muted-foreground">
            Create and manage your tasks
          </p>
        </div>
        <shad-button
          variant="outline"
          size="icon"
          @click="showCreateToDoModal"
          class="ml-4"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
        </shad-button>
      </div>

      <!-- Todo List with max height and scroll -->
      <div class="grid gap-1 max-h-[800px] overflow-y-auto overflow-x-hidden">
        <div v-if="myDayTodos.length > 0">
          <div v-for="todo in myDayTodos" :key="todo.id">
            <div
              class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <p>📝</p>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none flex items-center">
                  <Popover>
                    <PopoverTrigger as-child>
                      <p
                        class="hover:underline cursor-pointer flex items-center"
                      >
                        {{ todo.title }}
                        <span
                          v-if="todo.dueDateTime?.dateTime"
                          :class="{
                            'text-red-500': isOverdue(todo.dueDateTime.dateTime)
                          }"
                          class="text-sm text-gray-500 inline-flex items-center ml-2"
                        >
                          <iconify-icon icon="mdi:calendar" class="mr-1" />
                          (Due: {{ formatDate(todo.dueDateTime.dateTime) }})
                        </span>
                      </p>
                    </PopoverTrigger>
                    <PopoverContent class="w-[520px]">
                      <div
                        class="flex flex-col space-y-2 text-center sm:text-left"
                      >
                        <h3 class="text-lg font-semibold">{{ todo.title }}</h3>
                        <span
                          v-if="todo.dueDateTime?.dateTime"
                          :class="{
                            'text-red-500': isOverdue(todo.dueDateTime.dateTime)
                          }"
                          class="text-sm text-gray-500 inline-flex items-center"
                        >
                          <iconify-icon icon="mdi:calendar" class="mr-1" />
                          (Due: {{ formatDate(todo.dueDateTime.dateTime) }})
                        </span>
                        <p
                          v-if="todo.body.content"
                          class="text-xs text-muted-foreground"
                        >
                          {{ todo.body.content }}
                        </p>
                      </div>
                      <div class="flex justify-end mt-4">
                        <shad-button
                          v-if="!isLoading"
                          class="mt-2 text-xs"
                          size="sm"
                          variant="secondary"
                          @click="markAsDone(todo.id)"
                        >
                          Mark as Done
                        </shad-button>
                        <alp-loader
                          v-else
                          class="animate-spin opacity-25"
                          size="48"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </p>
                <p
                  v-if="todo.body.content"
                  class="text-xs text-muted-foreground line-clamp-3"
                >
                  {{ todo.body.content }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div
            class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <p>🎉</p>
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">Relax...</p>
              <p class="text-sm text-muted-foreground">No tasks for now</p>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ListTodo } from "lucide-vue-next";
import { useStore } from "vuex";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import { TodoStore } from "@/store/modules/todo";
import { useNotify } from "@/composable/notify";
import { TodoDto } from "@/network/dtos/todo-dto";

interface Todo {
  id: string;
  title: string;
  body: { content: string };
  createdDateTime: string;
  lastModifiedDateTime: string;
  dueDateTime?: { dateTime: string };
  isCompleted: boolean;
}

const store = useStore();
const { fireWarningToast, fireSuccessToast, fireErrorToast } = useNotify();

const myDayTodos = ref<Todo[]>([]);
const isLoading = ref(false);

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
}

function isOverdue(dueDateString: string): boolean {
  const dueDate = new Date(dueDateString);
  return dueDate < new Date();
}

async function markAsDone(todoId: string) {
  try {
    isLoading.value = true;
    const lists = await store.dispatch(TodoStore.actions.GET_TODO_LISTS);
    const tasksListId = lists.find(
      (list: any) => list.displayName === "Tasks"
    ).id;

    const rawTodo: TodoDto = {
      id: todoId,
      status: 2
    };
    const objectToDispatch = {
      listId: tasksListId,
      taskId: todoId,
      todo: rawTodo
    };
    await store.dispatch(TodoStore.actions.UPDATE_TODO, objectToDispatch);
    myDayTodos.value = await store.dispatch(TodoStore.actions.GET_MY_DAY_TODOS);
    isLoading.value = false;
    fireSuccessToast("Todo marked as done");
  } catch (error) {
    fireErrorToast("Error in updateTodo:" + error);
  }
}

function showCreateToDoModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.CreateTodoTask,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true)
    }
  });
}

onMounted(async () => {
  myDayTodos.value = await store.dispatch(TodoStore.actions.GET_MY_DAY_TODOS);
});
</script>

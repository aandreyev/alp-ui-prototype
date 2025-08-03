<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <MessageSquareDot class="w-5 h-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <!-- migrated from old reminder popover -->
      <div class="flex items-center justify-between">
        Reminders
        <alp-button variant="outline-success" @click="showCreateReminderModal">
          <font-awesome-icon icon="fa-solid fa-plus" class="green" />
        </alp-button>
      </div>
      <div class="h-80 overflow-y-auto">
        <span
          v-for="item in state.reminders"
          :key="item.id"
          class="flex items-center mx-3 my-1 p-2 text-xs bg-gray-50 rounded text-black"
        >
          <input
            type="checkbox"
            @change="(event) => markReminderComplete(event, item.id)"
          />
          <span class="flex-1 flex flex-col">
            <span class="flex justify-between">
              <span class="ml-3 text-2xs">
                {{ fmtToLocalShortDate(item.dueDate) }}
              </span>
              <action-button
                v-if="
                  toReminderResourceLink(
                    item.reminderType,
                    item.reminderTypeId
                  ) != null
                "
                :description="toReminderType(item.reminderType)"
                @click="
                  routeToReminderResource(
                    item.reminderType,
                    item.reminderTypeId
                  )
                "
                icon-name="fa-solid fa-link"
                :icon-size="12"
              />
            </span>
            <span class="flex">
              <span
                class="flex-1 ml-3 break-words text-xs prose prose-sm"
                v-html="item.message"
              />
            </span>
          </span>
        </span>
        <alp-empty
          v-if="state.reminders.length == 0"
          :content="'No reminder yet'"
          :subContent="'Create a reminder to start'"
        >
        </alp-empty>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { MessageSquareDot } from "lucide-vue-next";
import { computed, defineComponent, reactive, unref, watch } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";

//migrated from old reminder popover

import ActionButton from "@/components/common/ActionButton.vue";
import { fmtToLocalShortDate } from "@/composable/date";
import { usePagination } from "@/composable/pagination";
import { ReminderServiceProxy } from "@/network/common-service-proxies";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ReminderStore } from "@/store/modules/reminders";
import { ReminderDto } from "@/network/dtos/reminder-dto";
import { ReminderTypes } from "@/network/dtos/enumTypes";

const state = reactive({
  reminders: [] as ReminderDto[],
  remindersCount: 0
});

const store = useStore();

const totalReminders = computed(() => state.remindersCount);
const reminderCreateCount = computed(
  () => store.getters[ReminderStore.getters.CREATE_COUNT]
);

const { pageSize, total, currentPage, offset, lastPage, next, prev } =
  usePagination({
    currentPage: 1,
    pageSize: 20,
    total: totalReminders
  });

function fetchReminders() {
  new ReminderServiceProxy()
    .getReminderList(
      undefined,
      false,
      undefined,
      unref(pageSize),
      unref(offset)
    )
    .then((response) => {
      state.reminders = response.items || [];
      state.remindersCount = response.count || 0;
    });
}

watch([offset, pageSize], fetchReminders, {
  immediate: true
});
watch([() => reminderCreateCount], () => {
  () => fetchReminders();
});

function addReminder() {
  new ReminderServiceProxy()
    .createReminder(
      new ReminderDto({
        reminderType: ReminderTypes.ToDo,

        message: "Test Reminder"
      })
    )
    .then(() => {
      fetchReminders();
    });
}

function toReminderResourceLink(reminderType: number, reminderId: number) {
  switch (reminderType) {
    case ReminderTypes.ToDo:
      return null;
    case ReminderTypes.Document:
      return { name: "Resource Document", params: { id: reminderId } };
    default:
      return null;
  }
}

function toReminderType(reminderType: number) {
  switch (reminderType) {
    case ReminderTypes.ToDo:
      return "To Do";
    case ReminderTypes.Document:
      return "Document";
    default:
      return "";
  }
}

const router = useRouter();

function routeToReminderResource(reminderType: number, reminderId: number) {
  const link = toReminderResourceLink(reminderType, reminderId);
  store.commit(ReminderStore.mutations.REMINDER_RESOURCE_ID, reminderId);
  if (link) {
    router.push(link);
  }
}

function showCreateReminderModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.CreateReminder,
    props: { reminderType: "todo" }
  });
}

function markReminderComplete(event: Event, id: number) {
  new ReminderServiceProxy()
    .setReminderComplete(id, true)
    .then(() => fetchReminders());
}
</script>

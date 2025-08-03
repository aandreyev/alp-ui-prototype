<template>
  <div class="flex-1 min-h-0 w-full overflow-y-auto pt-2" ref="container">
    <div class="mb-3 px-2" v-for="item in items" :key="item.id" @load-more="fetch">
      <div
        class="flex items-center space-x-4 rounded-md border p-4 hover:ring-1 hover:ring-black transition-all"
      >
        <div class="flex flex-col mb-3">
          <div class="flex justify-between">
            <div class="bg-white rounded w-full overflow-hidden flex">
              <div class="w-full text-sm">
                <div class="leading-5 text-gray-900 font-semibold">
                  {{ item.name }}
                </div>
                <div class="flex flex-wrap items-center space-x-1">
                  <span class="truncate">{{ item.email }}</span>
                  <TooltipProvider :delay-duration="0">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <shad-button
                          variant="ghost"
                          size="icon"
                          @click.stop="addEmailGroupToEmail(item.email)"
                        >
                          <iconify-icon icon="lucide:mail" class="h-4 w-4" />
                        </shad-button>
                      </TooltipTrigger>
                      <TooltipContent>Email to {{ item.email }}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <shad-button
                          variant="ghost"
                          size="icon"
                          @click.stop="
                            copy(item.email).then(() =>
                              fireSuccessToast('Email copied to clipboard')
                            )
                          "
                        >
                          <iconify-icon icon="lucide:copy" class="h-4 w-4" />
                        </shad-button>
                      </TooltipTrigger>
                      <TooltipContent>Copy {{ item.email }}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div class="text-gray-600 text-xs truncate">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="sentinel" />
  </div>
</template>

<script setup lang="ts">
import { useInfiniteListable, useInfiniteTrigger } from "@/composable/infinite-list";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/lib/registry/new-york/ui/tooltip";
import { reactive, watch } from "vue";
import { useStore } from "vuex";
import { CommonStore } from "@/store/modules/common";
import { SendEmailStore } from "@/store/modules/send-email";
import { useClipboard } from "@vueuse/core";
import { useNotify } from "@/composable/notify";

const emit = defineEmits(["close"]);
const props = defineProps({
  lockIconClick: {},
  currentLockState: {},
  isOpen: {},
  isLockIcon: {
    type: Boolean,
    default: false,
  },
  search: {
    type: String,
  },
});

const store = useStore();
let SelectedOption = "people" as "people" | "groups";

const state = reactive({
  selectedOption: SelectedOption,
  search: "",
});

const { items, loading, fetch, reset } = useInfiniteListable({
  items: CommonStore.getters.GET_EMAILGROUPS,
  query: CommonStore.actions.GET_EMAILGROUPS,
  queryParams: () => ({
    search: props.search,
  }),
});

const { copy } = useClipboard();
const { fireSuccessToast } = useNotify();

function addEmailGroupToEmail(email: string) {
  let emailArray = [];
  store.commit(SendEmailStore.mutations.CLEAR_EMAIL, []);
  emailArray.push(email);
  store.commit(SendEmailStore.mutations.SET_TO, emailArray);
  store.commit(SendEmailStore.mutations.EMAIL_MODAL_OPEN);
  emit("close");
}

function loadMore() {
  if (loading.value) {
    return;
  }
  fetch();
}
const { container, sentinel } = useInfiniteTrigger(loadMore);

watch(() => props.search, reset);
</script>

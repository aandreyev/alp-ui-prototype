<template>
  <div class="flex-1 min-h-0 w-full overflow-y-auto pt-2" ref="container">
    <div
      class="mb-3 px-2"
      v-for="item in items"
      :key="item.id"
      @load-more="fetch"
    >
      <div
        class="flex items-center space-x-4 rounded-md border p-4 hover:ring-1 hover:ring-black transition-all"
      >
        <TooltipProvider :delay-duration="0">
          <div class="flex">
            <div class="flex-shrink-0 w-20 flex items-center justify-center">
              <div class="board board-gray-200">
                <img
                  class="object-cover w-16 h-16 rounded"
                  :src="
                    item.profilePictureUrl != null
                      ? item.profilePictureUrl
                      : '/default-profile-picture.png'
                  "
                  alt="user_icon"
                />
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-grow min-w-0 text-sm">
              <alp-default-badge
                v-if="item.office"
                :text="item.office?.abbreviation"
                :color="'green'"
                class="text-xs w-fit"
              />
              <div
                class="leading-5 text-gray-900 text-sm font-semibold pt-2 truncate"
              >
                {{ item.fullName }}
                <span class="text-gray-500">
                  - Rate: {{ fmtCurrency(item.billingRate) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center space-x-1">
                <span class="truncate">{{ item.email }}</span>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <shad-button
                      variant="ghost"
                      size="icon"
                      @click.stop="addUserEmailToEmail(item.email)"
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
              </div>

              <div class="flex flex-wrap items-center space-x-1">
                <span class="truncate">{{ item.contactNumber ?? "-" }}</span>
                <Tooltip v-if="item.contactNumber">
                  <TooltipTrigger as-child>
                    <shad-button
                      variant="ghost"
                      size="icon"
                      @click.stop="handlePhoneCall(item.contactNumber)"
                    >
                      <iconify-icon icon="lucide:phone" class="h-4 w-4" />
                    </shad-button>
                  </TooltipTrigger>
                  <TooltipContent>Call {{ item.contactNumber }}</TooltipContent>
                </Tooltip>
                <Tooltip v-if="item.contactNumber">
                  <TooltipTrigger as-child>
                    <shad-button
                      variant="ghost"
                      size="icon"
                      @click.stop="
                        copy(item.contactNumber).then(() =>
                          fireSuccessToast('Contact number copied to clipboard')
                        )
                      "
                    >
                      <iconify-icon icon="lucide:copy" class="h-4 w-4" />
                    </shad-button>
                  </TooltipTrigger>
                  <TooltipContent>Copy {{ item.contactNumber }}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
    <div ref="sentinel" />
  </div>
</template>

<script setup lang="ts">

import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";
import { UserStore } from "@/store/modules/users";
import { reactive, watch } from "vue";
import { useStore } from "vuex";
import { SendEmailStore } from "@/store/modules/send-email";
import { fmtCurrency } from "@/composable/currency";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/lib/registry/new-york/ui/tooltip";
import { useClipboard } from "@vueuse/core";
import { useNotify } from "@/composable/notify";

const emit = defineEmits(["close"]);
const props = defineProps({
  lockIconClick: {},
  currentLockState: {},
  isOpen: {},
  isLockIcon: {
    type: Boolean,
    default: false
  },
  search: {
    type: String
  }
});

const store = useStore();
let SelectedOption = "people" as "people" | "groups";

const state = reactive({
  selectedOption: SelectedOption,
  search: ""
});

const { items, loading, fetch, reset } = useInfiniteListable({
  items: UserStore.getters.GET_STAFF_DIRECTORY,
  query: UserStore.actions.GET_STAFF_DIRECTORY,
  queryParams: () => ({
    active: true,
    isRequireBillingRate: true,
    search: props.search
  })
});

const { copy } = useClipboard();
const { fireSuccessToast } = useNotify();

function addUserEmailToEmail(email: string) {
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

function handlePhoneCall(phoneNumber: string) {
  window.location.href = `tel:${phoneNumber}`;
}
</script>

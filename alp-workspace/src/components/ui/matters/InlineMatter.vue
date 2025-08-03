<style>
.pointer {
  cursor: pointer;
}
</style>

<template>
  <span class="block bg-white rounded-md p-2 border">
    <div class="flex flex-col flex-wrap">
      <div
        v-if="isLoading"
        class="flex flex-wrap justify-between font-medium gap-2 lg:gap-0 mb-2 lg:mb-0"
      >
        <div class="flex items-center">
          <Skeleton class="h-6 w-16 rounded-md" />
          <Skeleton class="h-5 w-48 ml-2 rounded-md" />
        </div>
        <div class="flex lg:space-x-4 flex-wrap lg:gap-0 gap-2">
          <Skeleton class="h-8 w-36 rounded-md" />
          <Skeleton class="h-8 w-24 ml-2 rounded-md" />
        </div>
      </div>

      <div
        v-else
        class="flex flex-wrap justify-between font-medium gap-2 lg:gap-0 mb-2 lg:mb-0 items-center"
      >
        <router-link
          :to="{ name: 'Matter', params: { id: matter.id } }"
          class="hover:text-blue-500"
          target="_blank"
        >
          <div class="flex items-center">
            <alp-default-badge :text="matter.id" :color="matterBadgeColor">
            </alp-default-badge>

            <span class="ml-2">{{ matter.name }}</span>
          </div>
        </router-link>
        <span class="flex lg:space-x-4 flex-wrap lg:gap-0 gap-2">
          <span class="flex items-center w-[280px]">
            <!-- Expected Work Delivery Date -->

            <date-field
              width="w-[280px]"
              name="estimatedClosingDate"
              placeholder="Expected Work Delivery Date"
              v-model="state.estimatedClosingDate"
              @update:modelValue="updateEstimatedClosingDate"
            />
          </span>

          <span class="flex pr-2 w-min-[280px]">
            <shad-select
              v-model="state.matterStatusTagId"
              @update:modelValue="updateMatterStatusTagId"
            >
              <shad-select-trigger class="w-full">
                <shad-select-value placeholder="Matter Status Tag" />
              </shad-select-trigger>
              <shad-select-content>
                <shad-select-group>
                  <shad-select-label>Matter Status Tag</shad-select-label>
                  <shad-select-item
                    v-for="option in matterStatusTagOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    <div>{{ option.label }}</div>
                  </shad-select-item>
                </shad-select-group>
              </shad-select-content>
            </shad-select>
          </span>

          <alp-button
            class="text-xs"
            variant="inverse"
            @click="showUpdateStatusModal"
          >
            {{ safeStatusDescription(matter?.status) }}
          </alp-button>
        </span>
      </div>

      <div v-if="isLoading" class="flex text-sm">
        <Skeleton class="h-5 w-56 rounded-md" />
      </div>

      <div v-else class="flex text-sm justify-between items-center py-2">
        <span>{{ matter.client?.clientName || "Unknown Client" }}</span>
        <div class="flex items-center space-x-2">
          <alp-default-badge
            v-if="matter.isCordinator"
            text="Coordinator"
            :color="matterBadgeColor"
          >
          </alp-default-badge>

          <alp-default-badge
            v-if="matter.isReviewer"
            text="Reviewer"
            :color="matterBadgeColor"
          >
          </alp-default-badge>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col mt-2 mb-2 items-baseline">
        <Skeleton class="h-5 w-40 mb-2 rounded-md" />
        <Skeleton class="h-24 w-full rounded-md mb-2" />
        <div class="flex gap-2 mx-3 mb-3 flex-wrap">
          <Skeleton class="h-8 w-24 rounded-lg" />
          <Skeleton class="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <div v-else class="flex flex-col mt-2 mb-2 items-baseline">
        <div v-if="matter.note">
          <div class="flex mb-2 flex-wrap space-x-2 text-xs">
            <span class="font-bold">Last Note </span>
            <span>from</span>
            <span className="font-bold">
              {{ matter.note?.insertedBy?.fullName }}
            </span>
            <span>at</span>
            <span className="font-bold">{{
              formatDate(matter.note?.insertedAt)
            }}</span>
            <div @click="showCreateMatterNoteModal" class="flex pointer">
              <iconify-icon icon="lucide:edit" class="w-4 h-4" />
            </div>
          </div>

          <div class="flex mb-1">
            <span
              className="min-w-0 text-sm font-semibold border-l-4 border-blue-600 pl-4 pt-2 pb-2"
              v-html="matter.note.message"
            />
          </div>

          <div class="flex gap-2 mx-3 mb-3 flex-wrap">
            <div v-for="file in matter.note.document" :key="file.id">
              <span
                class="bg-gray-100 border-gray-400 cursor-pointer gap-1 hover:bg-blue-100 inline-flex items-center py-1 px-2 rounded-lg"
                @click="previewDocument(file)"
              >
                <span class="flex items-center">
                  <document-icon
                    class="w-6 h-6"
                    :extension="file.fileExtension || ''"
                  />
                </span>
                <span class="text-xs"
                  >{{ file.fileName }}{{ file.fileExtension }}</span
                >
              </span>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="flex mb-2 items-center">
            <span class="text-sm font-semibold pr-2">Add a new note </span>
            <div @click="showCreateMatterNoteModal" class="flex pointer">
              <iconify-icon icon="lucide:edit" class="w-4 h-4" />
            </div>
          </div>
        </div>

        <div v-if="matter.secondToLastNote" class="mt-1">
          <div class="flex mb-2 flex-wrap space-x-2 text-xs">
            <span class="font-bold">Second to Last Note </span>
            <span>from</span>
            <span className="font-bold">
              {{ matter.secondToLastNote?.insertedBy?.fullName }}
            </span>
            <span>at</span>
            <span className="font-bold">{{
              formatDate(matter.secondToLastNote?.insertedAt)
            }}</span>
            <div @click="showCreateMatterNoteModal" class="flex pointer">
              <iconify-icon icon="lucide:edit" class="w-4 h-4" />
            </div>
          </div>

          <div class="flex mb-1">
            <span
              className="min-w-0 text-sm font-semibold border-l-4 border-green-600 pl-4 pt-2 pb-2"
              v-html="matter.secondToLastNote.message"
            />
          </div>

          <div class="flex gap-2 mx-3 mb-3 flex-wrap">
            <div
              v-for="file in matter.secondToLastNote.document"
              :key="file.id"
            >
              <span
                class="bg-gray-100 border-gray-400 cursor-pointer gap-1 hover:bg-blue-100 inline-flex items-center py-1 px-2 rounded-lg"
                @click="previewDocument(file)"
              >
                <span class="flex items-center">
                  <document-icon
                    class="w-6 h-6"
                    :extension="file.fileExtension || ''"
                  />
                </span>
                <span class="text-xs"
                  >{{ file.fileName }}{{ file.fileExtension }}</span
                >
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="flex mt-2 justify-between sm:space-x-2 lg:space-x-3 gap-1 sm:gap-0 flex-wrap"
      >
        <div v-for="i in 6" :key="i" class="w-full sm:w-auto sm:flex-1">
          <Skeleton class="h-16 w-full rounded-md" />
        </div>
      </div>

      <div
        v-else
        class="flex mt-2 justify-between sm:space-x-2 lg:space-x-3 gap-1 sm:gap-0 flex-wrap"
      >
        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            timeInStatus
          }}</span>
          <span class="text-black text-sm leading-none mt-1">Days Open</span>
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            safeCurrency(overview?.totalTimeValue)
          }}</span>
          <span class="text-black text-sm leading-none mt-1">Time Value</span>
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            safeCurrency(overview?.totalUnBilledTimeValue)
          }}</span>
          <span class="text-black text-sm leading-none mt-1">WIP</span>
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
          :class="{ 'text-orange-500': !isAllInvoicesSent }"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            safeCurrency(overview?.totalMatterInvoicedValue)
          }}</span>
          <span class="text-sm leading-none mt-1 flex items-center">
            Invoiced (Inc. GST)
            <shad-popover>
              <shad-popover-trigger>
                <iconify-icon
                  icon="lucide:help-circle"
                  class="w-4 h-4 ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                />
              </shad-popover-trigger>
              <shad-popover-content class="w-80 p-4">
                <div class="space-y-2">
                  <h4 class="font-medium">Invoice Details</h4>
                  <div class="grid grid-cols-2 gap-1 text-sm">
                    <span>Draft:</span>
                    <span>{{
                      safeCurrency(overview?.totalInvoiceValueInDraft)
                    }}</span>

                    <span>Awaiting Approval:</span>
                    <span>{{
                      safeCurrency(
                        overview?.totalInvoiceValueInAwaitingApproval
                      )
                    }}</span>

                    <span>Approved:</span>
                    <span>{{
                      safeCurrency(overview?.totalInvoiceValueInApproved)
                    }}</span>

                    <span>Sent Unpaid:</span>
                    <span>{{
                      safeCurrency(overview?.totalInvoiceValueInSentUnpaid)
                    }}</span>

                    <span>Sent Paid:</span>
                    <span>{{
                      safeCurrency(overview?.totalInvoiceValueInSentPaid)
                    }}</span>
                  </div>
                </div>
              </shad-popover-content>
            </shad-popover>
          </span>
        </div>

        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
          :class="{
            'text-red-600': (overview?.totalOutstandingOverdue || 0) > 0
          }"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            safeCurrency(overview?.matterOutstanding)
          }}</span>
          <span class="text-sm leading-none mt-1">Outstanding (Inc. GST)</span>
        </div>
        <div
          class="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center rounded-md border border-muted bg-popover py-2 px-2.5 hover:bg-accent hover:text-accent-foreground"
          :class="{ 'text-blue-600': (overview?.trustFunds || 0) > 0 }"
        >
          <span class="text-xl font-sans font-bold leading-none mb-1">{{
            safeCurrency(overview?.trustFunds)
          }}</span>
          <span class="text-sm leading-none mt-1">Trust Funds</span>
        </div>
      </div>
    </div>
  </span>

  <!-- File Preview -->
  <teleport to="body">
    <file-preview
      v-if="state.showPreview"
      :extension="state.previewDocument?.fileExtension"
      :document="state.previewDocument"
      :get-url="getDocumentUrl"
      :get-file="getDocumentFile"
      :emailid="0"
      @close="state.showPreview = false"
    />
  </teleport>
</template>

<script setup lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { useEnum } from "@/composable/enum";

import { MatterStore } from "@/store/modules/matters";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { ApiStore } from "@/store/utils";
import { Duration } from "luxon";
import {
  computed,
  onBeforeMount,
  reactive,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";

import { usePatchable } from "@/composable/patchable";
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import { Skeleton } from "@/lib/registry/new-york/ui/skeleton";
import FilePreview from "@/components/common/FilePreview.vue";
import { DocumentStore } from "@/store/modules/documents";
import { MatterStatus, MatterStatusTypes } from "@/network/dtos/enumTypes";
import {
  MatterListDto,
  MatterDto,
  MatterOverviewDto
} from "@/network/dtos/matter-dto";

const props = defineProps<{
  matter: MatterListDto;
  outcomeId: number | string;
  componentId: number | string;
}>();

const store = useStore();
const isLoading = ref(true);

const state = reactive({
  estimatedClosingDate: null,
  matterStatusTagId: null,
  showPreview: false,
  previewDocument: null as any
});

const { state: patchableState } = usePatchable<MatterDto>({
  identifier: props.matter.id ? props.matter.id : 0,
  getter: MatterStore.getters.GET_MATTER,
  query: MatterStore.actions.GET_MATTER,
  queryParams: () => ({ id: props.matter.id }),
  patchQuery: MatterStore.actions.PATCH_MATTER,
  patchQueryParams: () => ({ id: props.matter.id })
});

// Add a watch on patchableState to update the local state whenever it changes
watch(
  patchableState,
  (newValue) => {
    if (newValue) {
      if (newValue.estimatedClosingDate) {
        state.estimatedClosingDate = newValue.estimatedClosingDate;
      }
      if (newValue.matterStatusTagId) {
        state.matterStatusTagId = newValue.matterStatusTagId;
      }
    }
  },
  { immediate: true }
);

const overview = computed(() =>
  ApiStore.toData<MatterOverviewDto>(
    store.getters[MatterStore.getters.GET_MATTER_OVERVIEW](props.matter.id)
  )
);

// const embedLine = computed(() =>
//   ApiStore.toData<MatterDto>(
//     store.getters[MatterStore.getters.GET_MATTER](props.matter.id)
//   )
// );

const timeInStatus = computed(() => {
  const time = overview.value?.daysOpen;

  if (time != undefined) {
    return Duration.fromMillis(time).toFormat("d");
  } else return "NaN";
});

onBeforeMount(() => {
  isLoading.value = true;
  store
    .dispatch(MatterStore.actions.GET_MATTER_OVERVIEW, {
      id: props.matter.id
    })
    .finally(() => {
      isLoading.value = false;
    });
});

const { toDescription: toStatusDescription } = useEnum(MatterStatus);

function showUpdateStatusModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.UpdateMatterStatus,
    props: {
      id: props.matter.id
    }
  });
}

function showCreateMatterNoteModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.AddMatterNote,
    props: {
      id: props.matter.id,
      noteid:
        props.matter.note == undefined
          ? 0
          : props.matter.note.id == undefined
          ? 0
          : props.matter.note.id
    }
  });
}

const matterBadgeColor = computed(() => {
  switch (props.matter.status) {
    case 1:
      {
        return "yellow";
      }
      break;
    case 2:
      {
        return "yellow";
      }
      break;
    case 3:
      {
        return "red";
      }
      break;
    case 4:
      {
        return "blue";
      }
      break;
    case 5:
      {
        return "indigo";
      }
      break;
    case 6:
      {
        return "gray";
      }
      break;
  }
});
const matterStatusTagOptions = ref([
  {
    value: MatterStatusTypes.ActiveHigh,
    label: " Active - High (70+ units)"
  },
  {
    value: MatterStatusTypes.ActiveModerate,
    label: "Active - Moderate (30-70 units)"
  },
  {
    value: MatterStatusTypes.ActiveLow,
    label: "Active - Low (0-30 units)"
  },
  { value: MatterStatusTypes.ToBeFollowedUp, label: "To be followed up" },
  {
    value: MatterStatusTypes.WaitingforInternalreview,
    label: "Waiting for Internal review"
  },
  {
    value: MatterStatusTypes.Waitingforexternalpartytorespond,
    label: "Waiting for external party to respond"
  },
  { value: MatterStatusTypes.AdhocWork, label: "Ad hoc Work" },
  { value: MatterStatusTypes.Needtobebilled, label: "Need to be billed" },
  { value: MatterStatusTypes.BusinessBuilding, label: "Business Building" },
  { value: MatterStatusTypes.MatterClosed, label: "Matter Closed" }
]);

const safeCurrency = (value: number | undefined): string => {
  if (value === undefined) return fmtCurrency(0);
  return fmtCurrency(value);
};

const formatDate = (dateTime: any): string => {
  if (!dateTime) return "Unknown Date";
  try {
    return new Date(dateTime).toLocaleDateString("en-AU");
  } catch (e) {
    return "Invalid Date";
  }
};

const safeStatusDescription = (status: MatterStatus | undefined): string => {
  if (status === undefined) return "Unknown";
  return toStatusDescription(status as number);
};

const isAllInvoicesSent = computed(() => {
  // All invoices should be sent
  const invoicesClear =
    !(
      overview.value?.totalInvoiceValueInDraft ||
      overview.value?.totalInvoiceValueInAwaitingApproval ||
      overview.value?.totalInvoiceValueInApproved
    ) ||
    (overview.value?.totalInvoiceValueInDraft || 0) +
      (overview.value?.totalInvoiceValueInAwaitingApproval || 0) +
      (overview.value?.totalInvoiceValueInApproved || 0) ===
      0;
  return invoicesClear;
});

function previewDocument(file: any) {
  // Set the document for preview
  state.previewDocument = file;
  state.showPreview = true;
}

function getDocumentUrl() {
  return store.dispatch(DocumentStore.actions.GET_LINK, {
    id: state.previewDocument?.id
  });
}

function getDocumentFile() {
  return store.dispatch(DocumentStore.actions.DOWNLOAD, {
    id: state.previewDocument?.id
  });
}

function updateEstimatedClosingDate(value: any) {
  if (patchableState.value) {
    patchableState.value.estimatedClosingDate = value;
  }
}

function updateMatterStatusTagId(value: any) {
  if (patchableState.value) {
    patchableState.value.matterStatusTagId = value;
  }
}
</script>

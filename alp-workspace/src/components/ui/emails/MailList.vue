<template>
  <ScrollArea ref="scrollArea" class="mail-list flex items-start">
    <div
      class="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="flex items-center gap-3">
        <div class="relative w-full">
          <Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input v-model="state.search" placeholder="Search" class="pl-8" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Popover>
                <PopoverTrigger>
                  <Button variant="ghost" size="icon">
                    <Clock class="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="flex p-0">
                  <DateRangePicker
                    :openPicker="true"
                    @selected-range="fetchRangeValues"
                    :show-all-range="true"
                  />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <alp-can permission="ExportEmail2PDF">
                <Button
                  variant="ghost"
                  size="icon"
                  v-if="emailType === 'Matter' || emailType === 'Contact'"
                  @click="ExportEmailsToPDF"
                >
                  <iconify-icon icon="lucide:file-archive" class="size-4" />
                </Button>
              </alp-can>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <div class="flex-1 flex flex-col gap-2 p-4 pt-0">
      <TransitionGroup name="list" appear>
        <button
          v-for="item of items"
          :key="item.id"
          class="flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
          :class="{ 'bg-accent': state.selectedEmailID === item.id }"
          @click="selectMail(item)"
          @mouseenter="item.isHover = true"
          @mouseleave="item.isHover = false"
        >
          <div
            class="min-w-5"
            v-if="item.isHover || item.isChecked || state.IsAnyEmailSelected"
          >
            <shad-checkbox :checked="item.isChecked" @click.stop="HandleChecked(item)" />
          </div>
          <div class="flex-col w-full flex">
            <div class="flex w-full flex-col gap-1">
              <div class="flex items-center">
                <div class="flex items-center gap-2">
                  <div class="font-semibold">
                    {{ item.senderName }}
                  </div>
                  <span
                    v-if="!item.isRead"
                    class="flex h-2 w-2 rounded-full bg-blue-600"
                  />
                </div>
                <div class="ml-auto flex gap-2">
                  <Flag v-if="item.isFlag" class="size-4 text-red-700" />
                  <Scale v-if="item.isMatterAssigned" class="size-4" />
                  <Pin v-if="item.isPin" class="size-4" />
                  <Paperclip v-if="item.hasAttachments" class="size-4" />
                  <div
                    :class="
                      cn(
                        'ml-auto text-xs',
                        selectedMail === item.id
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )
                    "
                  >
                    <!-- {{
                      formatDistanceToNow(new Date(item.date), {
                        addSuffix: true
                      })
                    }} -->
                    {{ format(new Date(item.date), "dd MMM yyyy h:mm:ss a") }}
                  </div>
                </div>
              </div>
              <div class="text-xs font-medium line-clamp-1">
                {{ item.subject }}
              </div>
            </div>
            <div class="line-clamp-2 text-xs text-muted-foreground">
              {{ item.snippet.substring(0, 300) }}
            </div>
          </div>
        </button>

        <!-- Loading Skeleton -->
        <div v-if="loading && items.length === 0" class="space-y-3">
          <div
            v-for="i in 8"
            :key="i"
            class="flex items-center gap-2 rounded-lg border p-3"
          >
            <div class="min-w-5">
              <Skeleton class="h-4 w-4 rounded" />
            </div>
            <div class="flex-col w-full flex gap-2">
              <div class="flex w-full items-center justify-between">
                <Skeleton class="h-4 w-24 rounded" />
                <Skeleton class="h-4 w-32 rounded" />
              </div>
              <Skeleton class="h-4 w-full rounded" />
              <Skeleton class="h-4 w-full rounded" />
            </div>
          </div>
        </div>

        <!-- Handle Email Empty -->
        <alp-empty :content="'No email was found'" v-if="!loading && items.length === 0">
        </alp-empty>

        <!-- Load More Skeleton -->
        <div v-if="loading && items.length > 0" class="space-y-3 mt-2">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-2 rounded-lg border p-3"
          >
            <div class="min-w-5">
              <Skeleton class="h-4 w-4 rounded" />
            </div>
            <div class="flex-col w-full flex gap-2">
              <div class="flex w-full items-center justify-between">
                <Skeleton class="h-4 w-24 rounded" />
                <Skeleton class="h-4 w-32 rounded" />
              </div>
              <Skeleton class="h-4 w-full rounded" />
              <Skeleton class="h-4 w-full rounded" />
            </div>
          </div>
        </div>
      </TransitionGroup>
      <div ref="sentinel"></div>
      <!-- Sentinel element to observe -->
    </div>
  </ScrollArea>
</template>

<script lang="ts" setup>
import { ScrollArea } from "@/lib/registry/new-york/ui/scroll-area";
import { cn } from "@/lib/utils";
import { onMounted, reactive, ref, watch } from "vue";
import { Flag, Scale, Pin, Paperclip } from "lucide-vue-next";
import { useInfiniteListable } from "@/composable/infinite-list";
import { EmailStore } from "@/store/modules/emails";
import { toLocalDateTime } from "@/composable/date";
import store from "@/store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from "@/lib/registry/new-york/ui/tooltip";
import DateRangePicker from "@/lib/registry/new-york/ui/date-range-picker/DateRangePicker.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/registry/new-york/ui/popover";
import { Input } from "@/lib/registry/new-york/ui/input";
import { Clock } from "lucide-vue-next";
import { useNotify } from "@/composable/notify";
import { Button } from "@/lib/registry/new-york/ui/button";
import { Search } from "lucide-vue-next";
import format from "date-fns/format";
import { Skeleton } from "@/lib/registry/new-york/ui/skeleton";
import { EmailListDto } from "@/network/dtos/email-dto";

const props = defineProps<{
  getter: string;
  query: string;
  params: Record<string, any>;
  senderEmail?: String;
  cancelled?: Boolean;
  emailType: String;
  entityNumber: String;
}>();
const { items, loading, fetch, reset } = useInfiniteListable({
  items: props.getter,
  query: props.query,
  limit: props.params.limit,
  queryParams: () => ({
    toDate: state.toDate ? toLocalDateTime(state.toDate) : undefined,
    fromDate: state.fromDate ? toLocalDateTime(state.fromDate) : undefined,
    search: state.search,
    senderEmail: props.senderEmail,
    ...props.params,
  }),
});
const emit = defineEmits(["select-email", "isChecked"]);
const selectedMail = defineModel<string>("selectedMail", { required: false });
const state = reactive({
  selectedEmailID: 0,
  IsAnyEmailSelected: false,
  isChecked: false,
  search: "",
  fromDate: "",
  toDate: "",
  isLoadingMore: false,
});

function loadMore() {
  if (state.isLoadingMore) return;

  state.isLoadingMore = true;
  fetch().finally(() => {
    state.isLoadingMore = false;
  });
}

function fetchRangeValues(range: any) {
  if (range && range.start && range.end) {
    state.fromDate = range.start || "";
    state.toDate = range.end || "";
  }
}
const sentinel = ref<HTMLElement | null>(null);
const scrollArea = ref<HTMLElement | null>(null);

function checkSentinelVisibility() {
  if (!sentinel.value || loading.value) return;

  const rect = sentinel.value.getBoundingClientRect();
  const isVisible =
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  if (isVisible && !state.isLoadingMore) {
    loadMore();
  }
}

// Watch loading state to check sentinel visibility when loading completes
watch(loading, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // Loading just completed, check if sentinel is visible
    setTimeout(checkSentinelVisibility, 100);
  }
});

onMounted(() => {
  if (sentinel.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading.value) {
          loadMore();
        }
      },
      {
        rootMargin: "100px",
      }
    );

    observer.observe(sentinel.value);
  }

  // Add scroll event listener to check sentinel visibility
  const scrollElement = document.querySelector(".mail-list");
  if (scrollElement) {
    scrollElement.addEventListener("scroll", () => {
      if (!loading.value) {
        checkSentinelVisibility();
      }
    });
  }
});
let selectedData = Array<number>();
function selectMail(email: any) {
  if (selectedData.length == 0) {
    state.selectedEmailID = email.id;
    emit("select-email", email);
  }
}

function HandleChecked(value: any) {
  let tempItemsSelect = items.value as EmailListDto[];
  tempItemsSelect = tempItemsSelect.filter((x) => x.id == value.id);
  if (selectedData.indexOf(value.id ?? 0) > -1) {
    selectedData.splice(selectedData.indexOf(value.id ?? 0), 1);
    tempItemsSelect.map((x) => (x.isChecked = false));
  } else {
    selectedData.push(value.id ?? 0);
    tempItemsSelect.map((x) => (x.isChecked = true));
  }
  let tempItems = items.value as EmailListDto[];
  tempItems = tempItems.filter((x) => x.isChecked == true);
  state.IsAnyEmailSelected = tempItems.length > 0;
  if (tempItems.length > 0) emit("isChecked", true, selectedData, tempItems.length);
  else emit("isChecked", false, selectedData, tempItems.length);
}
watch(
  [() => state.search, () => state.fromDate, () => state.toDate, () => props.senderEmail],
  () => {
    reset();
  }
);
// update selected Email value after action like read,pin flag and all
let updateValue: any;
watch(
  [() => (updateValue = store.getters[EmailStore.getters.GET_UPDATE_EMAIL_VALUE])],
  () => {
    if (updateValue) {
      selectedData.splice(0);
      let tempItems = items.value as EmailListDto[];
      tempItems = tempItems.filter((x) => x.isChecked == true);
      tempItems.map((x) => (x.isChecked = false));
      state.IsAnyEmailSelected = false;
      emit("isChecked", false, selectedData, 0);
    }
  },
  { immediate: true, deep: true }
);
// open first email by default
watch(
  [() => items],
  () => {
    if (state.selectedEmailID == 0) {
      let tempItems = items.value as EmailListDto[];
      if (tempItems.length > 0) {
        const email = tempItems[0];
        selectMail(email);
      }
    }
  },
  { deep: true }
);
const { fireSuccessToast } = useNotify();
function ExportEmailsToPDF() {
  switch (props.emailType) {
    case "Matter":
      {
        store
          .dispatch(EmailStore.actions.EXPORT_MATTER_EMAILS_AS_PDF, {
            entityNumber: props.entityNumber,
          })
          .then(() => {
            fireSuccessToast(
              "Request has been send out to backend, please check back later at documents !"
            );
          });
      }
      break;
    case "Contact":
      {
        store
          .dispatch(EmailStore.actions.EXPORT_CONTACT_EMAILS_AS_PDF, {
            entityNumber: props.entityNumber,
          })
          .then(() => {
            fireSuccessToast(
              "Request has been send out to backend, please check back later at documents !"
            );
          });
      }
      break;
  }
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.list-leave-active {
  position: absolute;
}
.mail-list {
  height: calc(100vh - 150px);
}
</style>

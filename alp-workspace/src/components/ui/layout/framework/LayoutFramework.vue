<template>
  <TooltipProvider>
    <div class="relative flex h-svh flex-col bg-background overflow-hidden">
      <div class="border-grid flex flex-1 flex-col overflow-hidden">
        <SidebarProvider>
          <Sidebar v-bind="props">
            <SidebarHeader>
              <TenantsSwitcher />
            </SidebarHeader>
            <SidebarContent>
              <NavMain />
            </SidebarContent>
            <SidebarFooter>
              <NavUser />
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset
            class="w-0 flex-1 text-black flex flex-col overflow-hidden"
          >
            <header
              class="flex sticky bg-background/95 backdrop-blur top-0 z-10 h-14 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
              <div class="flex items-center gap-2 px-4 w-full">
                <div class="flex items-center gap-2">
                  <SidebarTrigger class="-ml-1 h-5 w-5" />
                  <Separator orientation="vertical" class="mr-2 h-4" />
                </div>
                <Header class="flex-1" />
              </div>
            </header>
            <main class="flex-1 overflow-auto">
              <router-view class="w-full min-w-0" />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  </TooltipProvider>

  <!-- <div
    class="md:grid min-h-screen w-full md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] antialiased"
  >
    <div class="hidden border-r bg-muted/40 md:block">
      
    </div>
    <div class="flex flex-col">
      <header
        class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6"
      >
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="shrink-0 md:hidden">
              <Menu class="h-5 w-5" />
              <span class="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="flex flex-col">
            <UserSideMenu />
          </SheetContent>
        </Sheet>


      </header>
    </div>
  </div> -->

  <global-modals />
  <Toaster position="bottom-center" closeButton richColors />
</template>

<script setup lang="ts">
import { Separator } from "@/lib/registry/new-york/ui/separator";
import { computed, onMounted, watch } from "vue";
import { UserStore } from "@/store/modules/users";
import { TimeEntryStore } from "@/store/modules/time-entries";
import RouterView from "@/components/common/layout/RouterView.vue";
import GlobalModals from "@/components/modals/GlobalModals.vue";
import { ApiInfoStore } from "@/store/modules/api";
import { PermissionStore } from "@/store/modules/permissions";

import { reactive, unref } from "vue";

import { useStore } from "vuex";
import { ModalStore, ModalType } from "@/store/modules/modals";

import { SendEmailStore } from "@/store/modules/send-email";

import { useCan } from "@/composable/can";
import { AuthStore } from "@/store/modules/auth";
import { useRouter } from "vue-router";
import { DownloadStore } from "@/store/modules/downloads";
import { useClipboard } from "@vueuse/core";
import { useNotify } from "@/composable/notify";
import { FilterState } from "@/store/filterState";
import { DataTableStore } from "@/store/modules/datatable";
import { Toaster } from "@/lib/registry/new-york/ui/sonner";
import Header from "./Header.vue";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/lib/registry/new-york/ui/sidebar";

import type { SidebarProps } from "@/lib/registry/new-york/ui/sidebar";
import { TooltipProvider } from "@/lib/registry/new-york/ui/tooltip";
import NavUser from "./sidebar/NavUser.vue";
import NavMain from "./sidebar/NavMain.vue";
import TenantsSwitcher from "./sidebar/TenantsSwitcher.vue";
import { TimerType } from "@/network/dtos/enumTypes";
import { CreateTimerInput } from "@/network/dtos/timer-dto";
import { CurrentUserDto, UserListDto } from "@/network/dtos/user-dto";

const { canAny } = useCan();
const store = useStore();
const state = reactive({
  msg: false,
  isMenuClicked: false,
  isShowAdminMenu: false,
  isTimer: false,
  isDownloadClicked: false,
  isReminder: false,
  isNotification: false,
  isDocuments: false,
  isEmail: false,
  isStaffDirectory: false,
  user: new UserListDto()
});
onMounted(() => {
  store.dispatch(UserStore.actions.GET_ME);
  store.dispatch(PermissionStore.actions.UPDATE_PERMISSIONS);
  store.dispatch(ApiInfoStore.actions.GET_API_VERSION);
});
const routers = useRouter();
const currentRouteName = computed(() => routers.currentRoute.value.path);
let adminUrl: any;
watch(
  [() => (adminUrl = currentRouteName.value)],
  () => {
    if (adminUrl.includes("admin")) {
      state.isShowAdminMenu = true;
    }
    store.commit(DataTableStore.mutations.SET_SORTING_VALUE, "");
    store.commit(DataTableStore.mutations.SET_SORTING_HEADER, "");
    store.commit(DataTableStore.mutations.SET_FILTER_DATATABLE_STATE, "");
  },
  { immediate: true, deep: true }
);

function resetFilterState() {
  let filterState = new FilterState();
  filterState.clearAllFilterStates();
}
resetFilterState();
const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

const hasDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_DOWNLOADS]
);
const hasPendingDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_PENDING_DOWNLOADS]
);
const hasDraft = computed(
  () => store.getters[SendEmailStore.getters.HAVE_DRAFT]
);

const apiVersion = computed(
  () => store.getters[ApiInfoStore.getters.GET_API_VERSION]
);
const unitsCreateCount = computed(
  () => store.getters[TimeEntryStore.getters.CREATE_COUNT]
);

const emailModalOpenCount = computed(
  () => store.getters[SendEmailStore.getters.EMAIL_MODAL_OPEN]
);

function createTimer() {
  store.dispatch(
    TimeEntryStore.actions.CREATE_TIMER,
    new CreateTimerInput({
      type: TimerType.Free
    })
  );
}

const handleExpand = () => {
  if (state.isMenuClicked == true) return (state.msg = false);
  return false;
};

const handleClose = () => {
  if (state.isMenuClicked == true) return (state.msg = true);
  return false;
};

const handleMenuClick = () => {
  state.isMenuClicked = !state.isMenuClicked;
  if (state.isMenuClicked == true) state.msg = true;
  else state.msg = false;
};
function handleUpdatedValue(value: boolean) {
  state.isShowAdminMenu = value;
}

function handleRimderLockIconClick() {
  state.isReminder = !state.isReminder;
}
function handleDocumentLockIconClick() {
  state.isDocuments = !state.isDocuments;
}
function handleDownloadLockIconClick() {
  state.isDownloadClicked = !state.isDownloadClicked;
}
function handleNotificationLockIconClick() {
  state.isNotification = !state.isNotification;
}

function handleTimerLockIconClick() {
  state.isTimer = !state.isTimer;
}

function handleStaffDirectoryLockIconClick() {
  state.isStaffDirectory = false;
}

function handleEmailLockIconClick() {
  state.isEmail = false;
}
function showModal(type: ModalType, props: Record<string, unknown>) {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: type,
    props
  });
}

const router = useRouter();
function logOut() {
  store.dispatch(AuthStore.actions.LOGOUT).then(() => {
    router.push({ name: "Login" });
  });
}

function redirectToPorfilePage() {
  router.push("/user/me");
}

const { copy } = useClipboard();
const { fireSuccessToast } = useNotify();

function copyApplicationVersion() {
  if (unref(apiVersion)) {
    copy("version " + unref(apiVersion)).then(() =>
      fireSuccessToast("Application version copied to clipboard")
    );
  }
}

function handleMobileviewNatigation() {
  if (window.innerWidth < 300) handleMenuClick();
}
function OpenEmailPopup() {
  state.isEmail = true;
}
const handleMenuMobileClick = () => {
  state.isMenuClicked = true;
  state.msg = true;
  handleClose();
};
let mobileWidth: any;
// const routers = useRouter()
// const currentRouteName = computed(() => routers.currentRoute.value.name);
watch(
  [() => (mobileWidth = window.innerWidth), () => currentRouteName.value],
  () => {
    if (((mobileWidth < 768) as any) && currentRouteName.value != null)
      handleMenuMobileClick();
  },
  { immediate: true, deep: true }
);
//watch for email modal open count
watch(
  () => emailModalOpenCount,
  () => {
    OpenEmailPopup();
  }
);

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon"
});
</script>

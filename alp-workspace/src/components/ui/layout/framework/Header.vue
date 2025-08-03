<template>
  <nav class="flex items-center w-full">
    <alp-can permission="Core.View">
      <div class="flex-1">
        <PlatformSearch />
      </div>
    </alp-can>

    <div class="flex items-center justify-end gap-2 ml-auto">
      <alp-can permission="Core.View">
        <TimeValuePopover />
      </alp-can>
      <div class="hidden sm:flex items-center gap-2">
        <alp-can permission="Core.View">
          <NotificationPopover />
          <EmailPopover
            :name="''"
            :matterId="0"
            :rules="{}"
            :isLockIcon="true"
            v-if="!state.smallScreen"
          />
          <ReminderPopover />
          <ToDoPopover />
          <TimerPopover />
          <DocumentPopover />
        </alp-can>
        <DownloadPopover />
        <alp-can permission="Core.View">
          <QuickAddPopover />
          <StaffDirectorySliderover />
        </alp-can>
      </div>
    </div>
  </nav>

  <!-- Bottom bar for small screens -->
  <div
    class="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 h-14"
  >
    <div class="flex justify-around items-center h-full gap-2">
      <NotificationPopover />
      <EmailPopover
        :name="''"
        :matterId="0"
        :rules="{}"
        :isLockIcon="true"
        v-if="state.smallScreen"
      />
      <ReminderPopover />
      <TimerPopover />
      <DocumentPopover />
      <DownloadPopover />
      <QuickAddPopover />
      <StaffDirectorySliderover />
    </div>
  </div>
</template>

<script setup lang="ts">
import NotificationPopover from "./topPopover/NotificationPopover.vue";
import EmailPopover from "./topPopover/EmailPopover.vue";
import ReminderPopover from "./topPopover/ReminderPopover.vue";
import TimerPopover from "./topPopover/TimerPopover.vue";
import DocumentPopover from "./topPopover/DocumentPopover.vue";
import DownloadPopover from "./topPopover/DownloadPopover.vue";
import QuickAddPopover from "./topPopover/QuickAddPopover.vue";
import TimeValuePopover from "./topPopover/TimeValuePopover.vue";
import { AuthStore } from "@/store/modules/auth";
import { router } from "@/router";
import { useStore } from "vuex";
import { computed, reactive, ref, watch } from "vue";
import { UserStore } from "@/store/modules/users";
import StaffDirectorySliderover from "./topPopover/StaffDirectorySliderover.vue";
import { CurrentUserDto } from "@/network/dtos/user-dto";
import { useRouter } from "vue-router";
import { useMagicKeys } from "@vueuse/core";
import { ApiInfoStore } from "@/store/modules/api";
import PlatformSearch from "./topPopover/PlatformSearch.vue";
import ToDoPopover from "./topPopover/ToDoPopover.vue";
const store = useStore();

const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

const isOpen = ref(false);

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
  }
});

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1]) isOpen.value = true;
});

const $router = useRouter();

function logOut() {
  store.dispatch(AuthStore.actions.LOGOUT).then(() => {
    router.push({ name: "Login" });
  });
}

const apiVersion = computed(
  () => store.getters[ApiInfoStore.getters.GET_API_VERSION]
);

export interface NavItem {
  title: string | undefined;
  label: string | undefined;
  icon: string | undefined;
  variant: string | undefined;
  routerName: string | undefined;
  permission: string | undefined;
}
const state = reactive({
  smallScreen: false
});
let smallScreen: any;

watch(
  [() => (smallScreen = window.innerWidth)],
  () => {
    if ((smallScreen <= 639) as any) state.smallScreen = true;
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
@media (max-width: 640px) {
  main {
    padding-bottom: 4rem;
    /* Adjust this value based on your bottom bar height */
  }
}
</style>



<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <Bell class="w-5 h-5" :class="{ 'animate-bell': hasNotifications }" />
        <span
          v-if="hasNotifications"
          class="flex items-center justify-center h-3 w-3 absolute right-0 top-0 m-1"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
          >
          </span>
          <span
            class="relative inline-flex rounded-full h-2 w-2 bg-red-500"
          ></span>
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <div class="space-y-2">
        <h4 class="font-medium leading-none">Notifications</h4>
        <p class="text-sm text-muted-foreground">
          Select a notification to view.
        </p>
      </div>

      <div class="flex flex-col py-4 text-xs">
        <div class="h-[24rem] overflow-y-auto">
          <div
            class="flex-1 inline-block min-h-0 min-w-0 overflow-y-auto w-full pr-2"
            ref="container"
          >
            <div
              v-for="item in items"
              :key="item.id"
              class="mb-2 overflow-hidden rounded-md transition-all hover:bg-accent hover:text-accent-foreground"
              :class="{ 'bg-accent': !item.read }"
              @click="markAsRead(item)"
            >
              <div class="flex items-start space-x-4 p-2">
                <img
                  v-if="item.profilePictureUrl"
                  :src="item.profilePictureUrl"
                  alt="Profile"
                  class="mt-px h-5 w-5 rounded-full"
                />
                <img
                  v-else
                  src="/default-profile-picture.png"
                  alt="Default Profile"
                  class="mt-px h-5 w-5 rounded-full"
                />
                <div class="flex-1 space-y-1">
                  <p class="font-medium leading-none">
                    {{ notificationName(item) }}
                  </p>
                  <p class="text-muted-foreground" v-html="item.message"></p>
                  <div class="text-xs text-muted-foreground">
                    <font-awesome-icon
                      :icon="'fa-regular fa-clock'"
                      class="text-gray-500"
                    />
                    {{ fmtToLocalDatetime(item.insertedAt) }} ({{
                      fmtTimeDistance(item.insertedAt)
                    }})
                  </div>
                </div>
              </div>
            </div>
            <div ref="sentinel" />
            <alp-empty
              :content="'No notification to review'"
              v-if="items.length == 0"
            >
            </alp-empty>
          </div>
        </div>
      </div>
      <div class="flex justify-between space-x-2">
        <shad-button variant="ghost" @click="markAsAllRead">
          Mark all as read
        </shad-button>
        <shad-button variant="outline" @click="redirectToNotificationPage"
          >View all</shad-button
        >
      </div>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
import { Bell } from "lucide-vue-next";
import { watch, reactive, computed } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";

//migrated from old notification popover

import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";

import { router } from "@/router";
import { NotificationStore } from "@/store/modules/notifications";
import { ProjectStore } from "@/store/modules/projects";
import { useStore } from "vuex";
import { fmtToLocalDatetime, fmtTimeDistance } from "@/composable/date";
import { useWebNotification } from "@vueuse/core";
import { UserStore } from "@/store/modules/users";
import { NotificationTypesName } from "@/network/dtos/enumTypes";
import { NotificationDto } from "@/network/dtos/notification-dto";

const state = reactive({
  showHistory: false,
  readNotification: false
});
const { items, loading, fetch, reset } = useInfiniteListable({
  items: NotificationStore.getters.GET_NOTIFICATIONS,
  query: NotificationStore.actions.GET_NOTIFICATIONS,
  queryParams: () => ({})
});

watch([], reset);

function loadMore() {
  if (loading.value) {
    return;
  }

  fetch();
}

const { container, sentinel } = useInfiniteTrigger(loadMore);

const store = useStore();

function markAsRead(notificaton: NotificationDto) {
  store
    .dispatch(NotificationStore.actions.MARK_AS_READ, {
      id: notificaton.id
    })
    .then(() => {
      if (notificaton.notificationDiscriminator == "Invoice")
        router.push({
          name: "Invoice",
          params: { id: notificaton.invoiceId as any }
        });
      else if (notificaton.notificationDiscriminator == "Matter")
        router.push({
          name: "Matter",
          params: { id: notificaton.matterId as any }
        });
      else if (notificaton.notificationDiscriminator == "MatterComponent") {
        router.push({
          name: "Matter Component",
          params: {
            id: notificaton.matterId as any,
            outcomeId: notificaton.matterOutcomeId as any,
            componentId: notificaton.matterComponentId as any
          }
        });
      } else if (notificaton.notificationDiscriminator == "Project")
        router.push({
          name: "Project",
          params: { id: notificaton.projectId as any }
        });
      else if (notificaton.notificationDiscriminator == "ProjectTask") {
        let id = notificaton.projectId as any;
        router.push({
          name: "Project Task",
          params: { id, taskId: notificaton.projectTaskId as any }
        });
      }
      //  else if(notificaton.notificationDiscriminator == "Document")
      //  router.push({ name: "Document", params: { id: notificaton.documentId } });
      else if (notificaton.notificationDiscriminator == "TrustRequest")
        router.push({
          name: "Matter Trust",
          params: { id: notificaton.matterId as any }
        });
    });
}
function markAsAllRead() {
  state.readNotification = true;
  store.dispatch(NotificationStore.actions.MARK_AS_ALL_READ, {});
}

async function linkRef(notice: NotificationDto) {
  // mark as read first
  markAsRead(notice);
  // necessary temporary local vars
  var targetId = notice.message?.match(/\d+(?=\D*$)/)?.[0];
  const projectKey = "Project";
  const matterKey = "Matter";
  const invoiceKey = "Invoice";
  var projectChecker: boolean | undefined =
    notice.message?.includes(projectKey);
  var matterChecker: boolean | undefined = notice.message?.includes(matterKey);
  var invoiceChecker: boolean | undefined =
    notice.message?.includes(invoiceKey);
  // jump for project
  if (projectChecker == true) {
    store
      .dispatch(ProjectStore.actions.GET_PROJECTID_FROM_TASK, {
        id: targetId!
      })
      .then(async (val) => {
        await router.push({ name: "Project", params: { id: val } });
        router.go(0);
      });
  } else if (matterChecker == true) {
    await router.push({ name: "Matter", params: { id: targetId! } });
    router.go(0);
  } else if (invoiceChecker == true) {
    var targetInvoiceId = targetId!.slice(0, -1);
    await router.push({
      name: "Invoice",
      params: { id: targetInvoiceId! }
    });
    router.go(0);
  }
}
function notificationName(notification: NotificationDto) {
  switch (notification.types) {
    case NotificationTypesName.Message:
      return notification.sender?.fullName;
    case NotificationTypesName.Info:
      return `System Notification`;
    case NotificationTypesName.Warnning:
      return `System Notification`;
    case NotificationTypesName.Error:
      return `System Notification`;
  }
}

function redirectToNotificationPage() {
  router.push("/app/notifications");
}
function browserNotification() {
  if (items.value.length > 0) {
    let tempItems = items.value as NotificationDto[];
    let val = tempItems[0];
    const data = window.localStorage.getItem("notification");

    if (
      data != (val.id as any) &&
      val.read == false &&
      state.readNotification == false
    ) {
      let notificationMessage = val.message?.replace(/<\/?[^>]+(>|$)/g, "");
      const { isSupported, show, onClick } = useWebNotification({
        title: "ADLV LAW",
        dir: "auto",
        lang: "en",
        renotify: true,
        tag: "test",
        body: notificationMessage,
        icon: "/img/icons/android-chrome-192x192.png"
      });

      if (isSupported.value) {
        show(),
          onClick((evt: Event) => {
            evt.preventDefault();
            if (val.notificationDiscriminator == "Invoice")
              router.push({
                name: "Invoice",
                params: { id: val.invoiceId as any }
              });
            else if (val.notificationDiscriminator == "Matter")
              router.push({
                name: "Matter",
                params: { id: val.matterId as any }
              });
            else if (val.notificationDiscriminator == "MatterComponent") {
              router.push({
                name: "Matter Component",
                params: {
                  id: val.matterId as any,
                  outcomeId: val.matterOutcomeId as any,
                  componentId: val.matterComponentId as any
                }
              });
            } else if (val.notificationDiscriminator == "Project")
              router.push({
                name: "Project",
                params: { id: val.projectId as any }
              });
            else if (val.notificationDiscriminator == "ProjectTask") {
              let id = val.projectId as any;
              router.push({
                name: "Project Task",
                params: { id, taskId: val.projectTaskId as any }
              });
            }
            //  else if(notificaton.notificationDiscriminator == "Document")
            //  router.push({ name: "Document", params: { id: notificaton.documentId } });
            else if (val.notificationDiscriminator == "TrustRequest")
              router.push({
                name: "Matter Trust",
                params: { id: val.matterId as any }
              });
            //router.push({ name: "Matter Trust", params: { id: val.matterId as any } });
            //window.open(Nlink, '_blank');
          });
      }
      window.localStorage.setItem("notification", val.id as any);
    } else state.readNotification = false;
  }
}
watch(
  [() => items],
  () => {
    browserNotification();
  },
  { deep: true, immediate: true }
);

const hasNotifications = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasNotifications
);
</script>
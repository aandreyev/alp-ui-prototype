<script lang="ts" setup>

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/registry/new-york/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/lib/registry/new-york/ui/tooltip";
import { computed, onBeforeMount, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ModalStore, ModalType } from "@/store/modules/modals";
import store from "@/store";

export interface LinkProp {
  title: string;
  icon: string;
  variant: "default" | "ghost";
  routerName?: string;
  permission?: string;
  modalName?: string;
}

interface NavProps {
  isCollapsed: boolean;
  links: LinkProp[];
}

const props = defineProps<NavProps>();
let routers = useRouter();
const currentRouteName = computed(() => routers.currentRoute.value.name);

function raiseGlobalModal(modalName: string) {
  switch (modalName) {
    case "CreateContact":
      showModal(ModalType.CreateContact, {});
      break;
    case "CreateOrganisation":
      showModal(ModalType.CreateOrganisation, {});
      break;
    case "CreateClient":
      showModal(ModalType.CreateClient, {});
      break;
    case "CreateMatter":
      showModal(ModalType.CreateMatter, {});
      break;
    case "CreateProject":
      showModal(ModalType.CreateProject, {});
      break;
    case "CreateTimeEntry":
      showModal(ModalType.CreateTimeEntry, {});
      break;
    case "CreateInvoice":
      showModal(ModalType.CreateInvoice, {});
      break;
    case "CreateSupportTicket":
      showModal(ModalType.CreateSupportTicket, {});
      break;
  }
}

function showModal(type: ModalType, props: Record<string, unknown>) {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: type,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true)
    }
  });
}
</script>

<template>
  <div
    :data-collapsed="isCollapsed"
    class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
  >
    <nav
      class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
    >
      <template v-for="(link, index) of links">
        <alp-can :permission="link.permission">
          <TooltipProvider :delay-duration="0">
            <Tooltip v-if="isCollapsed" :key="`1-${index}`" :delay-duration="0">
              <TooltipTrigger as-child>
                <router-link
                  :to="{ name: link.routerName, params: { id: 0 } }"
                  :class="
                    cn(
                      buttonVariants({ variant: link.variant, size: 'icon' }),
                      'h-9 w-9',
                      link.variant === 'default' &&
                        'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                    )
                  "
                >
                  <iconify-icon :icon="link.icon" class="size-4" />
                  <span class="sr-only">{{ link.title }}</span>
                </router-link>
              </TooltipTrigger>
              <TooltipContent side="right" class="flex items-center gap-4">
                {{ link.title }}
                <span
                  v-if="link.modalName"
                  class="ml-auto text-muted-foreground"
                >
                  {{ link.modalName }}
                </span>
              </TooltipContent>
            </Tooltip>

            <router-link
              v-else
              :key="`2-${index}`"
              :to="{ name: link.routerName, params: { id: 0 } }"
              :class="
                cn(
                  buttonVariants({
                    variant:
                      currentRouteName == link.routerName ? 'default' : 'ghost',
                    size: 'sm'
                  }),
                  link.variant === 'default' &&
                    'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                  'justify-start'
                )
              "
            >
              <iconify-icon :icon="link.icon" class="mr-2 size-4" />
              {{ link.title }}
              <span
                v-if="link.modalName"
                :class="
                  cn(
                    'ml-auto',
                    link.variant === 'default' &&
                      'text-background dark:text-white'
                  )
                "
              >
                <a
                  class="hover:text-blue-500 hover:rounded-full"
                  @click.prevent="raiseGlobalModal(link.modalName)"
                >
                  <iconify-icon icon="lucide:plus" class="size-4" />
                </a>
              </span>
            </router-link>
          </TooltipProvider>
        </alp-can>
      </template>
    </nav>
  </div>
</template>

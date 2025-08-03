<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ isAdminRoute ? 'Admin Menu' : 'User Menu' }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-for="(linkGroup, index) in links" :key="index">
        <Collapsible 
          class="group/collapsible"
          :default-open="linkGroup.isExpanded"
          v-model:open="openStates[getStateKey(index)]"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="linkGroup.group">
                <iconify-icon 
                  v-if="linkGroup.links[0]?.icon"
                  :icon="linkGroup.links[0].icon"
                  class="mr-2 h-4 w-4"
                />
                <span>{{ linkGroup.group }}</span>
                <ChevronRight 
                  :class="[
                    'ml-auto transform transition-transform duration-200 ease-in-out',
                    openStates[getStateKey(index)] ? 'rotate-90' : 'rotate-0'
                  ]"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <template v-for="link in linkGroup.links" :key="link.title">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      as-child
                      :data-active="currentRouteName === link.routerName"
                      :size="'md'"
                    >
                      <router-link :to="{ name: link.routerName }" class="flex items-center w-full text-zinc-950">
                        <!-- <iconify-icon 
                          :icon="link.icon" 
                          class="mr-2 h-4 w-4"
                        /> -->
                        <span>{{ link.title }}</span>
                        <span v-if="link.modalName" class="ml-auto">
                          <a
                            class="hover:text-blue-500 hover:rounded-full"
                            @click.prevent="raiseGlobalModal(link.modalName)"
                          >
                            <iconify-icon icon="lucide:plus" class="h-4 w-4" />
                          </a>
                        </span>
                      </router-link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </template>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/registry/new-york/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/lib/registry/new-york/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-vue-next'
import { allUserLinks, allAdminLinks } from "@/components/ui/layout/framework/navLinks";
import { ModalStore, ModalType } from "@/store/modules/modals";
import store from "@/store";
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCan } from "@/composable/can";


interface LinkProp {
  title: string;
  icon: string;
  variant: 'default' | 'ghost';
  routerName: string;
  permission?: string;
  modalName?: string;
}

interface LinkGroup {
  group: string;
  isExpanded?: boolean;
  links: LinkProp[];
}

const openStates = ref<Record<string, boolean>>({})

onMounted(() => {
  allUserLinks.forEach((group, index) => {
    openStates.value[`user_${index}`] = group.isExpanded || false
  })
  
  allAdminLinks.forEach((group, index) => {
    openStates.value[`admin_${index}`] = group.isExpanded || false
  })
})

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

const router = useRouter();
const currentRouteName = computed(() => router.currentRoute.value.name);
const isAdminRoute = computed(() => router.currentRoute.value.path.startsWith('/admin'));

const { canAny } = useCan();

// Filter links based on permissions
const filterLinksByPermission = (links: LinkProp[]) => {
  return links.filter(link => !link.permission || canAny([link.permission]));
};

// Filter groups and their links based on permissions
const filterGroupsByPermission = (groups: LinkGroup[]) => {
  return groups
    .map(group => ({
      ...group,
      links: filterLinksByPermission(group.links)
    }))
    .filter(group => group.links.length > 0); // Remove empty groups
};

// Update the links computed property to include permission filtering
const links = computed(() => {
  const menuLinks = isAdminRoute.value ? allAdminLinks : allUserLinks;
  return filterGroupsByPermission(menuLinks);
});

const getStateKey = (index: number) => isAdminRoute.value ? `admin_${index}` : `user_${index}`
</script>
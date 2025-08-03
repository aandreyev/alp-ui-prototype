
<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <Plus class="w-5 h-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <!-- migrated from old quick add popover -->
      <MenuItems
        class="origin-top-right w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="flex flex-wrap">
          <div
            class="w-full text-center bg-gray-100 p-2 font-semibold uppercase text-black"
          >
            Add
          </div>
          <div class="w-full gap-3 grid grid-cols-3 p-4">
            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateContact, {})"
              >
                <iconify-icon icon="lucide:contact" class="mb-1 w-8 h-8" />
                <span>Contact</span>
              </a>
            </MenuItem>

            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateOrganisation, {})"
              >
                <iconify-icon icon="lucide:building-2" class="mb-1 w-8 h-8" />
                <span>Organization</span>
              </a>
            </MenuItem>

            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateClient, {})"
              >
                <iconify-icon icon="lucide:book-user" class="mb-1 w-8 h-8" />
                <span>Client</span>
              </a>
            </MenuItem>
            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateMatter, {})"
              >
                <iconify-icon icon="lucide:scale" class="mb-1 w-8 h-8" />
                <span>Matter</span>
              </a>
            </MenuItem>

            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateTimeEntry, {})"
              >
                <iconify-icon icon="lucide:clock" class="mb-1 w-8 h-8" />
                <span>Time Entry</span>
              </a>
            </MenuItem>

            <MenuItem class="flex flex-col w-full items-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateInvoice, {})"
              >
                <iconify-icon icon="lucide:receipt-text" class="mb-1 w-8 h-8" />
                <span>Invoice</span>
              </a>
            </MenuItem>

            <MenuItem class="flex flex-col w-full items-center justify-center">
              <a
                href="#"
                class="flex flex-col items-center p-2.5 text-sm font-medium rounded"
                @click="showModal(ModalType.CreateProject, {})"
              >
                <iconify-icon icon="lucide:kanban" class="mb-1 w-8 h-8" />
                <span>Project</span>
              </a>
            </MenuItem>
          </div>
        </div>
      </MenuItems>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import { ModalStore, ModalType } from "@/store/modules/modals";
import store from "@/store";


function showModal(type: ModalType, props: Record<string, unknown>) {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: type,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true)
    }
  });
}

//migrated from old quick add popover
</script>

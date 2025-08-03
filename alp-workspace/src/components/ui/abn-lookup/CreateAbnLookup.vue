<template>
  <shad-modal-form
    modalTitle="ABN Lookup"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    :isLoading="state.isLoading"
    @submitValue="updateABN"
    :hideConfirmButton="state.hideConfirmButton"
  >
    <div class="relative w-full">
      <Input v-model="state.abnName" placeholder="Please enter organisation name" class="pl-4 pr-8" />
      <Search
        v-if="!state.isLoading"
        class="absolute right-2 top-2.5 size-4 text-muted-foreground cursor-pointer"
        @click="searchAbn"
      />
      <font-awesome-icon
        v-if="state.isLoading"
        icon="fa-solid fa-circle-notch"
        class="mr-2 h-4 w-4 animate-spin absolute right-2 top-2.5 size-4 text-muted-foreground cursor-pointer"
      />

      <shad-data-table
        v-if="abnlookup.records.length > 0"
        :columns="columns"
        :data="abnlookup.records"
        :count="0"
        @selected-row="rowClick"
      >
        <template v-slot:icon="{ row }">
          <RadioGroup v-model="state.selectedAbn" :orientation="'vertical'">
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                :id="'radio-' + row.Abn"
                :value="row"
                class="cursor-pointer"
                :checked="row.isChecked"
              />
            </div>
          </RadioGroup>
        </template>
        <template v-slot:Abn="{ row }">
          <div class="flex flex-col">
            <span>{{ row.Abn }}</span>
            <div class="mt-1">
              <span v-if="row.AbnStatus == '0000000001'">
                <shad-badge class="bg-green-600 hover:bg-green-600"
                  >Active</shad-badge
                >
              </span>
              <span v-if="row.AbnStatus == '0000000002'">
                <shad-badge variant="secondary">Cancelled</shad-badge>
              </span>
            </div>
          </div>
        </template>

        <template v-slot:State="{ row }">
          <span>{{ row.Postcode }} {{ row.State }}</span>
        </template>
      </shad-data-table>
      <div
        class="p-8 text-center text-muted-foreground"
        v-if="abnlookup.records.length == 0"
      >
        No records
      </div>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { Input } from "@/lib/registry/new-york/ui/input";
import { OrganisationStore } from "@/store/modules/organisations";
import { h, reactive } from "vue";
import { useStore } from "vuex";
import { OrganisationDto } from "@/network/dtos/organisation-dto";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { ColumnDef } from "@tanstack/vue-table";
import { useNotify } from "@/composable/notify";
import {
  RadioGroup,
  RadioGroupItem
} from "@/lib/registry/new-york/ui/radio-group";

const props = defineProps<{
  modalOpen: number;
  id: number;
}>();
const state = reactive({
  hideConfirmButton: true,
  abnName: "",
  closeModel: false,
  isLoading: false,
  organisation: {} as OrganisationDto,
  selectedAbn: ""
});

const store = useStore();

interface AbnRecord {
  Abn: string;
  AbnStatus: string;
  Postcode: string;
  State: string;
  Name: string;
  IsCurrent: boolean;
  NameType: string;
  Score: string;
  isChecked: boolean;
}
const abnlookup = reactive({
  records: [] as AbnRecord[]
});
const { fireErrorToast } = useNotify();
async function searchAbn() {
  if (state.abnName != "") {
    state.isLoading = true;
    abnlookup.records.splice(0);
    const name = state.abnName;
    await store
      .dispatch(OrganisationStore.getters.GET_ORGANISATION_ABN_DATA_BY_NAME, {
        name
      })
      .then((result) => {
        const values = result?.Names || [];
        if (values.length > 0) {
          values.forEach((record: any) => {
            const newRecord: AbnRecord = {
              Abn: record.Abn || "",
              AbnStatus: record.AbnStatus || "",
              Postcode: record.Postcode || "",
              State: record.State || "",
              Name: record.Name || "",
              NameType: record.NameType || "",
              IsCurrent: record.IsCurrent,
              Score: record.Score,
              isChecked: false
            };
            abnlookup.records.push(newRecord);
          });
          state.hideConfirmButton = false;
          state.isLoading = false;
        } else {
          state.isLoading = false;
        }
      });
  } else {
    fireErrorToast("Name is required");
  }
}

const columns: ColumnDef<AbnRecord>[] = [
  {
    accessorKey: "Abn",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "ABN" }),
    cell: ({ row }) => h("td", row.getValue("Abn"))
  },
  {
    accessorKey: "Name",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Name" }),
    cell: ({ row }) => h("td", row.getValue("Name"))
  },
  {
    accessorKey: "NameType",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Type" }),
    cell: ({ row }) => h("td", row.getValue("NameType"))
  },
  {
    accessorKey: "State",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Location" }),
    cell: ({ row }) => h("td", row.getValue("State"))
  }
];
function closeDialog() {
  state.closeModel = false;
  abnlookup.records.splice(0);
  state.abnName = "";
  state.hideConfirmButton = true;
}
function updateABN() {
  if (state.selectedAbn) {
    state.organisation.name = state.selectedAbn.Name;
    state.organisation.abn = state.selectedAbn.Abn;
    store.dispatch(OrganisationStore.actions.PATCH_ORGANISATION, {
      id: props.id,
      original: store.getters[OrganisationStore.getters.GET_ORGANISATION](
        props.id
      ),
      updated: state.organisation
    });
    state.closeModel = true;
    abnlookup.records.splice(0);
    state.abnName = "";
    state.hideConfirmButton = true;
  } else {
    fireErrorToast("Please select an ABN.");
  }
}
function rowClick(value: any) {
  value.isChecked = true;
  state.selectedAbn = value;
}
</script>

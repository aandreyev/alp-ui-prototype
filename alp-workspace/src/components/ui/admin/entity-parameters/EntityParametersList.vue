<template>
  <table-layout-container>
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">{{ entityName }}</h2>
        <div class="flex items-center justify-between space-y-2">
          <p class="text-muted-foreground text-xs">
            {{ entityParameters.length }} {{ entityName }} in search result
          </p>
        </div>
      </div>

      <div
        v-if="can('DynamicParameter.Create')"
        class="flex items-center space-x-2"
      >
        <shad-button
          size="sm"
          @click="state.showCreateEntityParameterModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Add Parameter
        </shad-button>
      </div>
    </div>
    <shad-data-table
      :columns="columns"
      :data="entityParameters"
      :count="0"
      :columnFilter="columnFilterValues"
      @load-more="loadMore"
      @selected-row-page="rowListBySize"
    >
      <template v-slot:action="{ row }">
        <div class="flex justify-end">
          <alp-button-with-text
            context="Delete"
            :color="'red'"
            icon-name="fa-solid fa-trash fa-2xl"
            @click.stop="deleteEntityParameterValue(row.id)"
          />
        </div>
      </template>
    </shad-data-table>
  </table-layout-container>
  <create-entity-parameter
    v-if="state.showCreateEntityParameterModal"
    :entityType="entityType"
    @close="state.showCreateEntityParameterModal = false"
  />
</template>

<script setup lang="ts">
import CreateEntityParameter from "@/components/ui/admin/entity-parameters/CreateEntityParameter.vue";

import { useCan } from "@/composable/can";
import { EntityDynamicParameterDto } from "@/network/dtos/dynamic-parameter-dto";
import { EntityType } from "@/network/dtos/enumTypes";
import { EntityParameterStore } from "@/store/modules/entity-parameters";
import { ApiStore } from "@/store/utils";
import { computed, h, onMounted, reactive, watch } from "vue";
import { useStore } from "vuex";
import { ColumnDef } from "@tanstack/vue-table";
import { DataTableStore } from "@/store/modules/datatable";

import { useEnum } from "@/composable/enum";

import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";

const props = defineProps<{
  entityType: string;
}>();

const { can } = useCan();

const entityName = computed(() => EntityType[parseInt(props.entityType)]);

const state = reactive({
  showCreateEntityParameterModal: false
});

const store = useStore();

const entityParameters = computed(
  () =>
    ApiStore.toData(
      store.getters[EntityParameterStore.getters.GET_ENTITY_PARAMETERS]
    ) || []
);

onMounted(() => {
  store.dispatch(EntityParameterStore.actions.GET_ENTITY_PARAMETERS, {
    entityType: props.entityType
  });
});
console.log("entityParameters", entityParameters);
watch(
  () => props.entityType,
  () => {
    store.dispatch(EntityParameterStore.actions.GET_ENTITY_PARAMETERS, {
      entityType: props.entityType
    });
  }
);

function deleteEntityParameterValue(id: number) {
  store.dispatch(EntityParameterStore.actions.DELETE_ENTITY_PARAMETER, {
    id
  });
}

// region DataTable

store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "adminEntityParametersDataTable"
);

enum ColumnFilter {
  Id = 0,
  Name = 1
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(EntityParameterStore.actions.GET_ENTITY_PARAMETERS, {
    entityType: props.entityType,
    limit: limit,
    offset: offset,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
function limitOffsetUpdate(limit: number, offset: number) {
  store.commit(DataTableStore.mutations.SET_LIMIT, limit);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
}
function rowListBySize(pageSize: any) {
  limitOffsetUpdate(pageSize, offset);
  storeUpdate(pageSize, "", "");
}
let offset = 0;
let limit = 50;

function loadMore(pagenumber: any, rowlimit: any) {
  if (pagenumber != "") {
    offset = 50 * (pagenumber - 1);
  } else offset = 0;

  if (rowlimit != undefined && rowlimit != "") {
    limit = rowlimit;
    offset = rowlimit * (pagenumber - 1);
  }
  limitOffsetUpdate(limit, offset);
  storeUpdate(limit, "", "");
}

function sortingList(sort: any, header: any) {
  store.dispatch(EntityParameterStore.actions.GET_ENTITY_PARAMETERS, {
    entityType: props.entityType,
    limit: store.getters[DataTableStore.getters.GET_LIMIT],
    offset: store.getters[DataTableStore.getters.GET_OFFSET],
    sort: sort,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
let selectedvalue: any, selectedheader: any;
watch(
  [
    () =>
      (selectedheader =
        store.getters[DataTableStore.getters.GET_SORTING_HEADER]),
    () =>
      (selectedvalue = store.getters[DataTableStore.getters.GET_SORTING_VALUE])
  ],
  () => {
    if (
      selectedvalue != "" &&
      selectedvalue != undefined &&
      selectedheader != "" &&
      selectedheader != undefined
    )
      sortingList(selectedvalue, selectedheader);
  },
  { immediate: true, deep: true }
);
const columns: ColumnDef<EntityDynamicParameterDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "parameterName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Name" })
  }
];
</script>

<template>
  <table-layout-container>
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Time Entries</h2>
        <div class="flex items-center justify-between space-y-2">
          <p class="text-muted-foreground text-xs"></p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <shad-button size="sm" @click="showCreateTimeEntryModal">
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Add Time Entry
        </shad-button>
      </div>
    </div>
    <shad-data-table
      className="time-entries"
      :columns="columns"
      :data="items"
      :count="listCount"
      :columnFilter="columnFilterValues"
      @load-more="loadMore"
      @selected-row-page="rowListBySize"
    >
      <template v-slot:date="{ row }">
        <td>
          {{ fmtToLocalShortDate(row.date) }}
        </td>
      </template>

      <template v-slot:rate="{ row }">
        <span v-if="row.rate" class="font-semibold">
          <span> {{ fmtCurrency(row.rate) }}/Hour </span>
        </span>
      </template>
    </shad-data-table>
  </table-layout-container>
</template>

<script setup lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { fmtToLocalShortDate } from "@/composable/date";
import { useInfiniteListable } from "@/composable/infinite-list";

import { ModalStore, ModalType } from "@/store/modules/modals";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { computed, defineComponent, h, reactive, watch } from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { DataTableStore } from "@/store/modules/datatable";
import { useEnum } from "@/composable/enum";
import { ApiStore } from "@/store/utils";
import { ColumnDef } from "@tanstack/vue-table";
import { UserStore } from "@/store/modules/users";
import { MatterStore } from "@/store/modules/matters";
import { MatterDto } from "@/network/dtos/matter-dto";
import { TimeEntryDtoPaginatedDto } from "@/network/dtos/time-entry-dto";
import { CurrentUserDto } from "@/network/dtos/user-dto";

const props = defineProps<{
  matterId: [String, Number];
  outcomeId: [String, Number];
  id: [String, Number];
}>();
const state = reactive({
  search: ""
});

const { items, loading, fetch, reset } = useInfiniteListable({
  items: TimeEntryStore.getters.GET_MATTER_COMPONENT_TIME_ENTRIES,
  query: TimeEntryStore.actions.GET_MATTER_COMPONENT_TIME_ENTRIES,
  queryParams: () => ({
    matterId: props.matterId,
    outcomeId: props.outcomeId,
    componentId: props.id,
    search: state.search,
    startDate: undefined,
    endDate: undefined
  })
});

const store = useStore();
const currentfetchUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);
const matter = computed(() =>
  ApiStore.toData<MatterDto>(
    store.getters[MatterStore.getters.GET_MATTER](props.matterId)
  )
);
watch([() => state.search], reset);

const currentUserRate = getCurrentUserRate();
function getCurrentUserRate() {
  let rate = 0;

  console.log("matter.value", matter.value);

  if (matter.value != null) {
    if (
      matter.value.applyRateAdjustment == true &&
      matter.value.rateAdjustmentPercentage != null
    ) {
      rate = Math.ceil(
        currentUser.value?.billingRate *
          (1 + matter.value.rateAdjustmentPercentage / 100)
      );
    } else {
      rate = currentUser.value?.billingRate;
    }
  } else {
    rate = currentUser.value?.billingRate;
  }

  return rate;
}

function showCreateTimeEntryModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.CreateMatterComponentTimeEntry,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true),
      matterId: props.matterId,
      outcomeId: props.outcomeId,
      componentId: props.id,
      user: currentfetchUser,
      initUserRate: getCurrentUserRate()
    }
  });
}

store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "matterOutcomeTimeEntriesDataTable"
);
enum ColumnFilter {
  Id = 0,
  Description = 1,
  Date = 2,
  Units = 3
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(TimeEntryStore.actions.GET_MATTER_COMPONENT_TIME_ENTRIES, {
    matterId: props.matterId,
    outcomeId: props.outcomeId,
    componentId: props.id,
    search: state.search,
    startDate: undefined,
    endDate: undefined,
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
const listCount = computed(
  () =>
    ApiStore.toData<TimeEntryDtoPaginatedDto>(
      store.getters[TimeEntryStore.actions.GET_MATTER_COMPONENT_TIME_ENTRIES]
    )?.count || 0
);
const columns: ColumnDef<TimeEntryDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" }),
    enableSorting: false
  },
  {
    accessorKey: "date",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Date" }),
    enableSorting: false
  },
  {
    accessorKey: "units",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Units" }),
    enableSorting: false
  },
  {
    accessorKey: "rate",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Rate" }),
    enableSorting: false
  },
  {
    accessorKey: "user.fullName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "User" }),
    enableSorting: false
  }
];
</script>

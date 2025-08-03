<template>
  <div
    class="flex-1 inline-block overflow-y-auto overflow-x-auto"
    ref="container"
  >
    <div class="h-full flex-1 flex-col space-y-4 px-2 md:flex relative">
      <div class="flex items-center justify-between space-y-2">
        <div>
          <div class="flex items-center space-x-2">
            <data-table-summary
              :totalCount="listCount"
              :selectedCount="selectedRows.length"
              :totalValue="
                selectedRows.reduce(
                  (total, row) =>
                    total + ((row.rate ?? 0) * (row.units ?? 0)) / 10,
                  0
                )
              "
              :formatter="fmtCurrency"
              totalLabel="matter time entries found"
              selectedLabel="selected"
              totalValueLabel="Total"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-2">
            <shad-button
              v-if="selectedRows.length > 0"
              size="sm"
              variant="outline"
              @click="showTransferModal"
            >
              <font-awesome-icon icon="fa-solid fa-exchange-alt" class="mr-2" />
              Convert or Move Matter Time
            </shad-button>
            <shad-button size="sm" @click="showCreateEntryModal">
              <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
              Add a matter time entry
            </shad-button>
          </div>
        </div>
      </div>
      <shad-data-table
        className="time-entries"
        :columns="columns"
        :data="items"
        :count="listCount"
        :searchValue="state.search"
        searchPlaceholder="Search time entires..."
        :columnFilter="columnFilterValues"
        @selected-row="$emit('selected', $event)"
        @load-more="loadMore"
        @selected-row-page="rowListBySize"
        @search="debouncedSearch"
        @selected-status="fetchStatus"
        :selectedColumn="state.selectedColumn"
        :enableRowSelection="true"
        @row-selection-change="handleRowSelection"
        :multiselectfilter="false"
        :hideColumnFilter="[]"
        :updateColumnFilter="false"
        :showActiveStatus="false"
      >
        <template v-slot:datatablefilter>
          <OwnerFilter
            v-model="state.user"
            :resetFilter="state.resetFilter"
            :canClear="true"
            @selected="selectFilter"
          />

          <BilledStatusFilter
            v-model="state.invoiced"
            :resetFilter="state.resetFilter"
            :canClear="true"
            @selected="selectFilter"
            :show-status="true"
          />
          <BillableFilter
            v-model="state.billableType"
            :resetFilter="state.resetFilter"
            :canClear="true"
            @selected="selectFilter"
          />
          <DateRangePicker
            :resetFilter="state.resetFilter"
            @selected-range="fetchRangeValues"
            :show-all-range="true"
          />
        </template>
        <template v-slot:matterComponent.matterOutcome.matter.id="{ row }">
          <shad-badge
            class="bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
            >{{ row.matterComponent.matterOutcome.matter.id }}</shad-badge
          >
        </template>
        <template
          v-slot:matterComponent.matterOutcome.matter.client.clientName="{
            row
          }"
        >
          <router-link
            :to="{
              name: 'Client',
              params: {
                id: row.matterComponent.matterOutcome.matter.client.id
              }
            }"
            target="_blank"
            class="text-blue-500 hover:text-blue-700 pl-2"
            @click.stop=""
          >
            {{ row.matterComponent.matterOutcome.matter.client?.clientName }}
          </router-link>
        </template>
        <template v-slot:matterComponent.matterOutcome.matter.name="{ row }">
          <router-link
            :to="{
              name: 'Matter',
              params: {
                id: row.matterComponent.matterOutcome.matter.id
              }
            }"
            target="_blank"
            class="text-blue-500 hover:text-blue-700"
            @click.stop=""
          >
            {{ row.matterComponent.matterOutcome.matter.name }}
          </router-link>
        </template>
        <template v-slot:date="{ row }">
          {{ fmtToLocalShortDate(row.date) }}
        </template>
        <template v-slot:invoiceId="{ row }">
          <span v-if="row.invoiceId">
            <router-link
              :to="{
                name: 'Invoice',
                params: {
                  id: row.invoiceId
                }
              }"
              target="_blank"
              @click.stop=""
            >
              <shad-badge variant="outline">
                {{ row.invoiceId }}
              </shad-badge>
            </router-link>
          </span>
        </template>
        <template v-slot:rate="{ row }">
          <span v-if="row.rate" class="font-semibold">
            <span> {{ fmtCurrency(row.rate) }}/Hour </span>
          </span>
        </template>
        <template v-slot:value="{ row }">
          <span>
            <span
              class="font-semibold"
              :class="row.rate < 0 ? 'text-red-600' : 'text-black'"
            >
              {{ fmtCurrency((row.rate * row.units) / 10) }}</span
            >
          </span>
        </template>
        <template v-slot:billableType="{ row }">
          <span v-show="row.billableType">
            <shad-badge variant="outline">
              {{ fmtBillableType(row.billableType) }}
            </shad-badge>
          </span>
        </template>
      </shad-data-table>
    </div>

    <div ref="sentinel" />
  </div>
</template>

<script setup lang="ts">
import { fmtToLocalShortDate, toDateTime } from "@/composable/date";
import { fmtCurrency } from "@/composable/currency";
import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";

import { TimeEntryStore } from "@/store/modules/time-entries";
import { DateTime } from "luxon";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  PropType,
  reactive,
  watch,
  ref
} from "vue";
import DateRangePicker from "@/lib/registry/new-york/ui/date-range-picker/DateRangePicker.vue";

import { ColumnDef } from "@tanstack/vue-table";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import DataTableSummary from "@/components/common/layout/DataTable/DataTableSummary.vue";
import { DataTableStore } from "@/store/modules/datatable";
import { ApiStore } from "@/store/utils";
import { debounce } from "lodash";
import { FilterState, enumFilterState } from "@/store/filterState";
import OwnerFilter from "@/components/inputs/filters/OwnerFilter.vue";
import MatterFilter from "@/components/inputs/filters/MatterFilter.vue";
import BilledStatusFilter from "@/components/inputs/filters/BilledStatusFilter.vue";
import BillableFilter from "@/components/inputs/filters/BillableFilter.vue";
import { useStore } from "vuex";
import { useEnum } from "@/composable/enum";
import { DataTableFilterState } from "@/store/dataTableState";
// import CreateMatterTimeEntry from "@/components/modals/time-entry/CreateMatterTimeEntry.vue";
import { UserStore } from "@/store/modules/users";

import { MatterStore } from "@/store/modules/matters";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { BillableTypes } from "@/network/dtos/enumTypes";
import { MatterListDto, MatterDto } from "@/network/dtos/matter-dto";
import {
  TimeEntryDtoPaginatedDto,
  TimeEntryDto
} from "@/network/dtos/time-entry-dto";
import { UserListDto, CurrentUserDto } from "@/network/dtos/user-dto";

const props = defineProps<{
  id: string | number;
  startDate: DateTime;
  endDate: DateTime;
  billableType: BillableTypes | null;
  search: String;
  matter: MatterListDto;
  user: UserListDto;
}>();
let filterState = new FilterState();
const filterStateData = GetFilterState();

function GetFilterState() {
  let filterData = filterState.getItem(enumFilterState.TimesEntry);
  if (filterData) return filterData;
  return {
    search: ""
  };
}
const state = reactive({
  search: "",
  user: new UserListDto(),
  resetFilter: false,
  matter: new MatterListDto(),
  invoiced: filterStateData.invoiced,
  billableType: filterStateData.billableType,
  startDate: undefined as DateTime | undefined,
  endDate: undefined as DateTime | undefined,
  selectedColumn: 0
});
const emit = defineEmits(["selected", "click", "selected-range"]);

const store = useStore();
const { items, loading, fetch, reset } = useInfiniteListable({
  items: TimeEntryStore.getters.GET_MATTER_TIME_ENTRIES_FOR_MATTER,
  query: TimeEntryStore.actions.GET_MATTER_TIME_ENTRIES_FOR_MATTER,
  queryParams: () => ({
    id: props.id,
    search: state.search,
    startDate: state.startDate,
    endDate: state.endDate,
    invoiced: state.invoiced ?? undefined,
    billableType: state.billableType || undefined,
    matterId: state.matter?.id || undefined,
    userId: state.user?.id
  })
});
watch(
  [
    () => state.search,
    () => state.startDate,
    () => state.endDate,
    () => state.invoiced,
    () => state.billableType,
    () => state.user,
    () => state.matter
  ],
  reset
);

function type2String(numericalBillableType: number) {
  return BillableTypes[numericalBillableType];
}
function fmtBillableType(numericalBillableType: number) {
  let billableType = "";
  switch (BillableTypes[numericalBillableType]) {
    case BillableTypes[1]:
      billableType = "Billable";
      break;
    case BillableTypes[2]:
      billableType = "Non Billable";
      break;
    case BillableTypes[3]:
      billableType = "Non Chargeable";
      break;
    case BillableTypes[4]:
      billableType = "Pro Bono";
      break;
  }
  return billableType;
}
// columns definition
store.commit(
  DataTableStore.mutations.SET_FILTER_DATATABLE_STATE,
  "matterTimeEntriesForMatterDataTable"
);
enum ColumnFilter {
  Description = 1,
  Date = 2,
  Invoiced = 3,
  Units = 4,
  Rate = 5,
  Value = 6,
  BillableType = 7,
  User = 8
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(TimeEntryStore.actions.GET_MATTER_TIME_ENTRIES_FOR_MATTER, {
    id: props.id,
    search: state.search,
    startDate: undefined,
    endDate: undefined,
    invoiced: state.invoiced ?? undefined,
    billableType: state.billableType || undefined,
    matterId: state.matter?.id || undefined,
    userId: state.user?.id || undefined,
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
      store.getters[TimeEntryStore.actions.GET_MATTER_TIME_ENTRIES_FOR_MATTER]
    )?.count || 0
);

function sortingList(sort: any, header: any) {
  store.dispatch(TimeEntryStore.actions.GET_MATTER_TIME_ENTRIES_FOR_MATTER, {
    id: props.id,
    search: state.search,
    startDate: props.startDate,
    endDate: props.endDate,
    invoiced: state.invoiced ?? undefined,
    billableType: state.billableType || undefined,
    matterId: state.matter?.id || undefined,
    userId: state.user?.id || undefined,
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
const columns: ColumnDef<TimeEntryDto>[] = [
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" }),
    cell: ({ row }) => {
      return h("div", { class: "flex space-x-2" }, [
        h(
          "span",
          {
            class: "max-w-[500px] truncate font-medium",
            title: row.getValue("description")
          },
          row.getValue("description")
        )
      ]);
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Date" })
  },
  {
    accessorKey: "invoiceId",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Invoiced #" })
  },
  {
    accessorKey: "units",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Units" }),
    cell: ({ row }) => {
      return h("div", [
        h("span", { class: "truncate font-medium" }, row.getValue("units"))
      ]);
    }
  },
  {
    accessorKey: "rate",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Rate" })
  },
  {
    accessorKey: "value",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Value" }),
    enableSorting: false
  },
  {
    accessorKey: "billableType",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Billable Type" })
  },
  {
    accessorKey: "user.fullName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "User" })
  }
];
interface DateRange {
  start: Date;
  end: Date;
}
function fetchRangeValues(range: DateRange) {
  if (range && range.start && range.end) {
    state.startDate = toDateTime(range.start)?.toLocal();
    state.endDate = toDateTime(range.end)?.toLocal();
    if (
      new Date(range.start).setHours(0, 0, 0, 0) !=
        new Date().setHours(0, 0, 0, 0) ||
      new Date(range.end).setHours(23, 59, 59, 999) !=
        new Date().setHours(23, 59, 59, 999)
    ) {
      selectFilter(1);
    }
  }
  emit("selected-range", range);
}
let datatableState = new DataTableFilterState();

function fetchStatus(value: any, search: any) {
  state.resetFilter = true;
  store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    value
  );
}
store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, 0);
datatableState.setItem(
  store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
  0
);
function selectFilter(value: any) {
  state.resetFilter = false;

  store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    value
  );
}

const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);
const matter = computed(() =>
  ApiStore.toData<MatterDto>(
    store.getters[MatterStore.getters.GET_MATTER](props.id)
  )
);

const currentUserRate = getCurrentUserRate();

function getCurrentUserRate() {
  let rate = 0;
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

const currentfetchUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

function showCreateEntryModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.CreateTimeEntry,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true),
      defaultSelectedTab: "matter",
      startDate: state.startDate,
      endDate: state.endDate,
      initUserRate: getCurrentUserRate(),
      user:
        currentfetchUser.value == state.user ? currentfetchUser : state.user,
      matterId: props.id
    }
  });
}

const selectedRows = ref<TimeEntryDto[]>([]);

function handleRowSelection(rows: TimeEntryDto[]) {
  selectedRows.value = rows;
}

function showTransferModal() {
  if (selectedRows.value.length === 0) return;

  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.TransferOrMoveMatterTimeEntry,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true),
      chosenTimeEntries: selectedRows.value,
      startDate: state.startDate || props.startDate,
      endDate: state.endDate || props.endDate
    }
  });
}
</script>

<template>
  <span
    class="flex items-center bg-blue-100 bg-opacity-25 rounded-sm"
    v-if="reactiveShow"
  >
    <span class="w-8 flex items-center justify-center">
      <input
        class="checkbox text-green-400"
        type="checkbox"
        v-model="state.complete"
        @change="state.complete"
      />
    </span>
    <span class="flex-1 grid grid-cols-12 flex items-center text-xs py-1">
      <span
        class="col-span-4 flex items-center px-1 cursor-pointer hover:text-blue-500"
        @click="
          $router.push({
            name: 'Matter Component',
            params: { id: matterId, outcomeId, componentId: component.id }
          })
        "
      >
        {{ component.title }}
      </span>
      <div class="col-span-3 px-1 flex justify-center">
        <transition name="fade-fast" mode="out-in">
          <inline-timer
            v-if="activeTimer"
            :timer="activeTimer"
            @updated="$emit('updated')"
          />

          <alp-button v-else variant="success" @click="startTimer">
            <font-awesome-icon icon="fa-solid fa-play" />
          </alp-button>
        </transition>
      </div>

      <div class="col-span-1">
        {{ component.totalUnits || "-" }} / {{ component.estimatedUnits }} units
      </div>

      <div class="col-span-2 pr-1">
        <multi-user-selector
          class="w-full"
          :value="state.assigned"
          @selected="addTeamMember"
          @removed="removeTeamMember"
        />
      </div>

      <date-input
        class="col-span-2 outline-none"
        placeholder="Due Date"
        v-model="state.dueDate"
      />
    </span>

    <span class="mx-1">
      <!-- <alp-options>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="deleteComponent"
        >
          Delete
        </span>
      </alp-options> -->
      <span class="flex items-center justify-end">
        <action-button
          v-if="component.totalUnits <= 0"
          description="Delete Component"
          icon-name="fa-solid fa-trash"
          icon-class="text-red-500"
          @click.stop="deleteComponent"
        />
        <action-button
          v-else
          description="You cannot delete"
          icon-name="fa-solid fa-trash"
          icon-class="text-gray-500"
        />
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import InlineTimer from "@/components/common/InlineTimer.vue";
import DateInput from "@/components/inputs/DateInput.vue";
import MultiUserSelector from "@/components/inputs/selectors/MultiUserSelector.vue";
import { usePatchable } from "@/composable/patchable";
import { MatterStore } from "@/store/modules/matters";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import ActionButton from "@/components/common/ActionButton.vue";
import { TimerType } from "@/network/dtos/enumTypes";
import { MatterComponentDto } from "@/network/dtos/matter-dto";
import { CreateTimerInput } from "@/network/dtos/timer-dto";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["updated", "selected"],
  props: {
    matterId: {
      type: [String, Number],
      required: true
    },
    outcomeId: {
      type: [String, Number],
      required: true
    },
    component: {
      type: Object as PropType<MatterComponentDto>,
      required: true
    }
  },
  components: {
    DateInput,
    InlineTimer,
    MultiUserSelector,
    ActionButton
  },
  setup(props, { emit }) {
    let reactiveShow = true;
    const { state } = usePatchable<MatterComponentDto>({
      original: computed(() => props.component),
      patchQuery: MatterStore.actions.PATCH_MATTER_COMPONENT,
      patchQueryParams: () => ({
        matterId: props.matterId,
        outcomeId: props.outcomeId,
        componentId: props.component.id
      })
    });

    const store = useStore();

    function startTimer() {
      store
        .dispatch(
          TimeEntryStore.actions.CREATE_TIMER,
          new CreateTimerInput({
            type: TimerType.MatterComponent,
            entityId: props.component.id
          })
        )
        .then(() => emit("updated"));
    }

    const activeTimer = computed(() =>
      store.getters[TimeEntryStore.getters.GET_TIMER_FOR_TYPE](
        TimerType.MatterComponent,
        props.component.id
      )
    );

    function deleteComponent() {
      store.dispatch(MatterStore.actions.DELETE_MATTER_COMPONENT, {
        matterId: props.matterId,
        outcomeId: props.outcomeId,
        componentId: props.component.id
      });
    }

    function addTeamMember(user: UserListDto) {
      store.dispatch(MatterStore.actions.ADD_MATTER_COMPONENT_TEAM_MEMBER, {
        matterId: props.matterId,
        outcomeId: props.outcomeId,
        componentId: props.component.id,
        userId: user.id
      });
    }

    function removeTeamMember(user: UserListDto) {
      store.dispatch(MatterStore.actions.REMOVE_MATTER_COMPONENT_TEAM_MEMBER, {
        matterId: props.matterId,
        outcomeId: props.outcomeId,
        componentId: props.component.id,
        userId: user.id
      });
    }

    function changeShowStatus() {
      reactiveShow = !reactiveShow;
    }

    return {
      state,
      activeTimer,
      startTimer,
      deleteComponent,
      addTeamMember,
      removeTeamMember,
      reactiveShow,
      changeShowStatus
    };
  }
});
</script>

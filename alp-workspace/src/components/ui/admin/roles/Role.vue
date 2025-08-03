<template>
  <slide-over heading="Role Management" @close="$emit('close')">
    <div class="h-full flex flex-col">
      <div class="flex flex-col py-3 px-6 overflow-y-hidden">
        <span class="flex justify-between">
          <span class="font-medium py-3"> Role: {{ role?.name }} </span>
        </span>
        <span v-if="!role?.isSystemAdmin">
          <span class="mt-5 text-sm">
            <label class="">
              <input
                name="isDefaultRole"
                type="checkbox"
                v-model="state.role.isDefaultRole"
              />
              <span class="ml-2">Default Role</span>
            </label>
          </span>
        </span>
        <span
          v-if="role?.isSystemAdmin"
          class="w-full mt-8 uppercase text-sm text-center"
        >
          Cannot edit this role.
        </span>
        <template v-else>
          <span class="flex flex-col mt-5 overflow-y-auto">
            <label
              class="mb-1"
              v-for="permission in allPermissions"
              :key="permission"
            >
              <input
                type="checkbox"
                :checked="state.permissions?.has(permission)"
                @change="setPermission($event, permission)"
              />
              <span class="ml-2 text-sm">{{ permission }}</span>
            </label>
          </span>

          <span
            class="self-end mt-5 flex items-center bg-gray-500 text-white rounded-sm px-3 py-1 uppercase text-xs cursor-pointer hover:bg-gray-600"
            @click="updatePermissions"
          >
            <span>Save</span>
          </span>
        </template>
      </div>
    </div>
  </slide-over>
</template>

<script lang="ts">
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { fmtToLocalDatetime } from "@/composable/date";
import { useNotify } from "@/composable/notify";
import { RoleDto } from "@/network/dtos/user-dto";
import { RoleStore } from "@/store/modules/roles";
import cloneDeep from "lodash.clonedeep";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  unref,
  watch
} from "vue";
import { useStore } from "vuex";
const { fireSuccessToast } = useNotify();

export default defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    SlideOver
  },
  setup(props) {
    const store = useStore();

    const state = reactive({
      permissions: new Set(),
      role: {} as RoleDto
    });

    const allPermissions = computed(
      () => store.getters[RoleStore.getters.GET_ALL_PERMISSIONS]
    );
    const permissions = computed(() =>
      store.getters[RoleStore.getters.GET_PERMISSIONS](props.id)
    );
    const role = computed(() =>
      store.getters[RoleStore.getters.GET_ROLE](props.id)
    );

    function fetchAllPermissions() {
      store.dispatch(RoleStore.actions.GET_ALL_PERMISSIONS);
    }

    function fetchRole() {
      return store
        .dispatch(RoleStore.actions.GET_ROLE, { id: props.id })
        .then(() => loadRole());
    }

    function setPermission(event: any, permission: string) {
      if (event.target.checked) {
        state.permissions.add(permission);
      } else {
        state.permissions.delete(permission);
      }
    }

    function updatePermissions() {
      store
        .dispatch(RoleStore.actions.UPDATE_PERMISSIONS, {
          id: props.id,
          permissions: Array.from(state.permissions)
        })
        .then(() => {
          fireSuccessToast("Submitted !");
        });
    }

    onMounted(() => {
      fetchAllPermissions();
      fetchRole();
    });

    let ignore = false;

    function loadRole() {
      ignore = true;
      const role = cloneDeep(
        store.getters[RoleStore.getters.GET_ROLE](props.id)
      );
      Object.assign(state.role, role);
    }

    watch(
      () => state.role,
      () => {
        if (ignore) {
          ignore = false;
          return;
        }
        store
          .dispatch(RoleStore.actions.PATCH_ROLE, {
            original: store.getters[RoleStore.getters.GET_ROLE](props.id),
            updated: state.role
          })
          .finally(() => loadRole());
      },
      { deep: true }
    );

    watch(permissions, () => {
      state.permissions = new Set(unref(permissions));
    });

    return {
      state,
      allPermissions,
      role,
      fmtToLocalDatetime,
      setPermission,
      updatePermissions
    };
  }
});
</script>

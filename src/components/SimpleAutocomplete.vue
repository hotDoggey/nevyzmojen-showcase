<template>
    <div class="sa" ref="root">
        <label v-if="label && showLabel" class="sa__label">{{ label }}</label>

        <div
            class="sa__field"
            :class="{ 'sa__field--open': isOpen, 'sa__field--disabled': disabled }"
            :style="{ background: fieldBackground }"
        >
            <input
                ref="input"
                class="sa__input"
                :placeholder="placeholderText"
                :value="modelValueText"
                :disabled="disabled"
                autocomplete="off"
                @focus="open()"
                @input="onInput"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="selectActive()"
                @keydown.esc.prevent="close()"
            />

            <button
                v-if="clearable && !disabled && modelValue"
                type="button"
                class="sa__clear"
                aria-label="Clear"
                @click="clear"
            >
                ×
            </button>
            <button
                v-if="hasItems && !disabled"
                type="button"
                class="sa__chev"
                aria-label="Toggle"
                @click.stop="isOpen ? close() : (open(), $nextTick(() => $refs.input?.focus()))"
            >
                ▾
            </button>
        </div>

        <div v-if="isOpen" :class="['sa__menu', { 'sa__menu--above': menuAbove }]" role="listbox">
            <div v-if="loading" class="sa__item sa__item--meta">Loading…</div>

            <template v-else>
                <button
                    v-for="(item, idx) in items"
                    :key="itemKey(item, idx)"
                    type="button"
                    class="sa__item"
                    :class="{ 'sa__item--active': idx === activeIndex }"
                    @mouseenter="activeIndex = idx"
                    @click="select(item)"
                >
                    <div class="sa__title">{{ itemTitle(item) }}</div>
                    <div v-if="itemSubtitle(item)" class="sa__subtitle">
                        {{ itemSubtitle(item) }}
                    </div>
                </button>

                <div v-if="!items?.length" class="sa__item sa__item--meta">
                    {{ noDataText }}
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: "SimpleAutocomplete",
    props: {
        modelValue: { type: [String, Number, Object, null], default: null },
        // items should already be limited in parent (e.g. first 10)
        items: { type: Array, default: () => [] },

        label: { type: String, default: "" },
        placeholder: { type: String, default: "" },
        noDataText: { type: String, default: "No results" },

        loading: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        clearable: { type: Boolean, default: true },
        // whether the dropdown/menu should open above the input instead of below
        menuAbove: { type: Boolean, default: false },
        // Show the external label above the field. If false the label will be
        // used as the inside placeholder only (useful to avoid duplicate titles).
        showLabel: { type: Boolean, default: true },
        // background for the input field; defaults to site container bg CSS var
        fieldBackground: { type: String, default: "var(--global-containers-background-color)" },

        // tell the component how to read fields from your item objects
        titleKey: { type: String, default: "name" },
        subtitleKey: { type: String, default: "" }, // e.g. "address.fullAddressString"
        valueKey: { type: String, default: "id" },
    },
    emits: ["update:modelValue", "search", "select"],
    data() {
        return {
            isOpen: false,
            activeIndex: -1,
            query: "",
        };
    },
    computed: {
        modelValueText() {
            // show chosen item title in the input
            if (!this.modelValue) return this.query;

            // if parent passes the full selected object as modelValue
            if (typeof this.modelValue === "object") return this.itemTitle(this.modelValue);

            // if parent passes an id, try find it in items
            const match = (this.items || []).find(
                (x) => String(this.itemValue(x)) === String(this.modelValue),
            );
            return match ? this.itemTitle(match) : this.query;
        },
        placeholderText() {
            // prefer explicit placeholder prop; otherwise show label as placeholder when empty
            if (this.placeholder) return this.placeholder;
            if (!this.modelValue && !this.query && this.label) return this.label;
            return "";
        },
        hasItems() {
            return Array.isArray(this.items) && this.items.length > 0 && !this.loading;
        },
    },
    mounted() {
        document.addEventListener("click", this.onDocClick, { capture: true });
    },
    beforeUnmount() {
        document.removeEventListener("click", this.onDocClick, { capture: true });
    },
    methods: {
        open() {
            if (this.disabled) return;
            this.isOpen = true;
        },
        close() {
            this.isOpen = false;
            this.activeIndex = -1;
        },
        clear() {
            this.query = "";
            this.$emit("update:modelValue", null);
            this.$emit("search", ""); // parent can clear results
            this.open();
            this.$nextTick(() => this.$refs.input?.focus());
        },
        onInput(e) {
            this.query = e.target.value;
            this.$emit("search", this.query); // parent decides when/how to fetch
            this.open();
            this.activeIndex = this.items?.length ? 0 : -1;
            // if user types, clear selection (optional)
            this.$emit("update:modelValue", null);
        },
        move(delta) {
            if (!this.isOpen) this.open();
            const n = this.items?.length || 0;
            if (!n) return;
            const next = this.activeIndex < 0 ? 0 : (this.activeIndex + delta + n) % n;
            this.activeIndex = next;
        },
        selectActive() {
            if (this.activeIndex < 0) return;
            const item = this.items[this.activeIndex];
            if (item) this.select(item);
        },
        select(item) {
            // by default emit the valueKey (id). If you prefer emitting the whole object, change this line.
            const value = this.itemValue(item);
            this.$emit("update:modelValue", value);
            this.$emit("select", item);
            this.query = this.itemTitle(item);
            this.close();
        },
        onDocClick(e) {
            const root = this.$refs.root;
            if (!root) return;
            if (!root.contains(e.target)) this.close();
        },

        // helpers
        itemKey(item, idx) {
            return this.itemValue(item) ?? idx;
        },
        itemValue(item) {
            return item?.[this.valueKey];
        },
        itemTitle(item) {
            return item?.[this.titleKey] ?? "";
        },
        itemSubtitle(item) {
            if (!this.subtitleKey) return "";
            // allow dot path e.g. "address.fullAddressString"
            return (
                this.subtitleKey.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), item) ??
                ""
            );
        },
    },
};
</script>

<style scoped>
.sa {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    margin-top: -10px; /* negative top pull to close gap with search field above */
    margin-bottom: 0;
}

.sa__label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 6px;
    opacity: 0.9;
}

.sa__field {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 56px; /* matches Vuetify 3 outlined text-field default density */
    border: 1px solid rgba(0, 0, 0, 0.35);
    border-radius: 4px;
    background: #fff;
}

.sa__field--open {
    border-color: rgba(0, 0, 0, 0.6);
}

.sa__field--disabled {
    opacity: 0.6;
}

.sa__input {
    width: 100%;
    border: 0;
    outline: none;
    padding: 8px 40px 8px 16px; /* horizontal padding matches Vuetify outlined field */
    font-size: 1rem;
    background: transparent;
}

.sa__clear {
    position: absolute;
    top: 50%;
    right: 44px;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.06);
    cursor: pointer;
    font-size: 18px;
    line-height: 28px;
}

.sa__chev {
    position: absolute;
    top: 50%;
    right: 10px; /* sit at the far right inside the field */
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
}

.sa__menu {
    position: absolute;
    left: 0;
    right: 0;
    margin-top: 6px;
    border: 1px solid rgba(0, 0, 0, 0.18);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 320px;
    overflow: auto;
    z-index: 9999;
}

.sa__menu--above {
    bottom: calc(100% + 6px);
    top: auto;
    margin-top: 0;
    margin-bottom: 6px;
}

.sa__input::placeholder {
    color: rgba(0, 0, 0, 0.45);
}

.sa__item {
    width: 100%;
    text-align: left;
    border: 0;
    background: transparent;
    padding: 10px 12px;
    cursor: pointer;
}

.sa__item:hover,
.sa__item--active {
    background: rgba(0, 0, 0, 0.06);
}

.sa__title {
    font-size: 0.95rem;
}

.sa__subtitle {
    font-size: 0.8rem;
    opacity: 0.75;
    margin-top: 2px;
}

.sa__item--Meta {
    cursor: default;
    opacity: 0.8;
}
</style>

<template>
    <v-container fluid class="design-system">
        <v-row>
            <v-col cols="12">
                <h1 class="text-h2 mb-2">Design System</h1>
                <p class="text-subtitle-1 mb-8" style="color: var(--secondary-color)">
                    A minimalist, unified design language for your application
                </p>
            </v-col>
        </v-row>

        <!-- Color Palette Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Color Palette</h2>
                    <div class="section-divider mb-6"></div>

                    <!-- Primary Colors -->
                    <h3 class="text-h6 mb-3">Primary Shades</h3>
                    <v-row class="mb-6">
                        <v-col
                            v-for="color in primaryColors"
                            :key="color.name"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <div
                                class="color-swatch"
                                :style="{ backgroundColor: color.value, color: color.textColor }"
                            >
                                <div class="color-name">{{ color.name }}</div>
                                <div class="color-value">{{ color.value }}</div>
                            </div>
                        </v-col>
                    </v-row>

                    <!-- Secondary/Neutral Colors -->
                    <h3 class="text-h6 mb-3">Secondary & Neutral Shades</h3>
                    <v-row class="mb-6">
                        <v-col
                            v-for="color in secondaryColors"
                            :key="color.name"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <div
                                class="color-swatch"
                                :style="{ backgroundColor: color.value, color: color.textColor }"
                            >
                                <div class="color-name">{{ color.name }}</div>
                                <div class="color-value">{{ color.value }}</div>
                            </div>
                        </v-col>
                    </v-row>

                    <!-- System Colors -->
                    <h3 class="text-h6 mb-3">System & Status Colors</h3>
                    <v-row>
                        <v-col
                            v-for="color in systemColors"
                            :key="color.name"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <div
                                class="color-swatch"
                                :style="{ backgroundColor: color.value, color: color.textColor }"
                            >
                                <div class="color-name">{{ color.name }}</div>
                                <div class="color-value">{{ color.value }}</div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>

        <!-- Buttons Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Buttons</h2>
                    <div class="section-divider mb-6"></div>

                    <!-- Primary Buttons -->
                    <div class="mb-6">
                        <h3 class="text-h6 mb-3">Primary Buttons</h3>
                        <div class="button-group">
                            <button class="primary-btn btn-small">Small</button>
                            <button class="primary-btn">Default</button>
                            <button class="primary-btn btn-large">Large</button>
                            <button class="primary-btn disabled">Disabled</button>
                        </div>
                    </div>

                    <!-- Secondary/Outlined Buttons -->
                    <div class="mb-6">
                        <h3 class="text-h6 mb-3">Secondary Buttons</h3>
                        <div class="button-group">
                            <button class="secondary-btn">Outlined</button>
                            <button class="secondary-btn btn-small">Small</button>
                            <button class="secondary-btn btn-large">Large</button>
                            <button class="secondary-btn disabled">Disabled</button>
                        </div>
                    </div>

                    <!-- Text/Ghost Buttons -->
                    <div class="mb-6">
                        <h3 class="text-h6 mb-3">Text Buttons</h3>
                        <div class="button-group">
                            <button class="text-btn">Text Button</button>
                            <button class="text-btn btn-small">Small</button>
                            <button class="text-btn btn-large">Large</button>
                            <button class="text-btn disabled">Disabled</button>
                        </div>
                    </div>

                    <!-- Status Buttons -->
                    <div class="mb-6">
                        <h3 class="text-h6 mb-3">Status Buttons</h3>
                        <div class="button-group">
                            <button class="success-btn">Success</button>
                            <button class="error-btn">Error</button>
                            <button class="warning-btn">Warning</button>
                            <button class="info-btn">Info</button>
                        </div>
                    </div>

                    <!-- Icon Buttons -->
                    <div>
                        <h3 class="text-h6 mb-3">Icon Buttons</h3>
                        <div class="button-group">
                            <button class="icon-btn primary-btn">✓</button>
                            <button class="icon-btn secondary-btn">×</button>
                            <button class="icon-btn text-btn">⚙</button>
                            <button class="icon-btn primary-btn">❤</button>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Typography Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Typography</h2>
                    <div class="section-divider mb-6"></div>

                    <div v-for="typo in typography" :key="typo.class" class="mb-4">
                        <div :class="typo.class">
                            {{ typo.sample }}
                        </div>
                        <code class="type-code">{{ typo.name }} - {{ typo.cssClass }}</code>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Cards Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Cards & Containers</h2>
                    <div class="section-divider mb-6"></div>

                    <v-row>
                        <v-col cols="12" md="4">
                            <div class="content-card elevation-1">
                                <h3 class="card-title">Subtle Elevation</h3>
                                <p class="card-text">
                                    This card has minimal shadow for subtle depth and hierarchy.
                                </p>
                                <div class="card-actions">
                                    <button class="primary-btn btn-small">Action</button>
                                    <button class="text-btn btn-small">Cancel</button>
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="12" md="4">
                            <div class="content-card elevation-2">
                                <h3 class="card-title">Standard Elevation</h3>
                                <p class="card-text">
                                    This card has moderate shadow for emphasis and separation.
                                </p>
                                <div class="card-actions">
                                    <button class="primary-btn btn-small">Action</button>
                                    <button class="text-btn btn-small">Cancel</button>
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="12" md="4">
                            <div class="content-card elevation-3">
                                <h3 class="card-title">Prominent Elevation</h3>
                                <p class="card-text">
                                    This card has higher shadow for maximum prominence.
                                </p>
                                <div class="card-actions">
                                    <button class="primary-btn btn-small">Action</button>
                                    <button class="text-btn btn-small">Cancel</button>
                                </div>
                            </div>
                        </v-col>
                    </v-row>

                    <v-row class="mt-4">
                        <v-col cols="12" md="6">
                            <div class="content-card outlined">
                                <h3 class="card-title">Outlined Card</h3>
                                <p class="card-text">
                                    A card with a border instead of shadow for a lighter feel.
                                </p>
                                <div class="card-actions">
                                    <button class="secondary-btn btn-small">Action</button>
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="12" md="6">
                            <div class="content-card dark-card">
                                <h3 class="card-title" style="color: #fff">Dark Theme Card</h3>
                                <p class="card-text" style="color: #fff">
                                    A card with dark background for contrast sections.
                                </p>
                                <div class="card-actions">
                                    <button
                                        class="primary-btn btn-small"
                                        style="background-color: #fff; color: #333"
                                    >
                                        Action
                                    </button>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>

        <!-- Form Elements Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Form Elements</h2>
                    <div class="section-divider mb-6"></div>

                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="form-group">
                                <label class="form-label">Text Input</label>
                                <input type="text" class="form-input" placeholder="Enter text" />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Text Input with Error</label>
                                <input
                                    type="text"
                                    class="form-input error"
                                    placeholder="Invalid input"
                                />
                                <span class="error-message">This field is required</span>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Textarea</label>
                                <textarea
                                    class="form-input"
                                    rows="4"
                                    placeholder="Enter longer text"
                                ></textarea>
                            </div>
                        </v-col>

                        <v-col cols="12" md="6">
                            <div class="form-group">
                                <label class="form-label">Select Dropdown</label>
                                <select class="form-input">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" class="form-checkbox" />
                                    <span>Checkbox option</span>
                                </label>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" class="form-checkbox" checked />
                                    <span>Checked checkbox</span>
                                </label>
                            </div>

                            <div class="form-group">
                                <label class="radio-label">
                                    <input type="radio" name="radio-group" class="form-radio" />
                                    <span>Radio option 1</span>
                                </label>
                            </div>

                            <div class="form-group">
                                <label class="radio-label">
                                    <input
                                        type="radio"
                                        name="radio-group"
                                        class="form-radio"
                                        checked
                                    />
                                    <span>Radio option 2</span>
                                </label>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>

        <!-- Links Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Links & Navigation</h2>
                    <div class="section-divider mb-6"></div>

                    <div class="mb-4">
                        <h3 class="text-h6 mb-3">Link Styles</h3>
                        <p>
                            <a href="#" class="default-link">Default link</a> |
                            <a href="#" class="internal-link">Internal link (underlined)</a> |
                            <a href="#" class="hint-text">Hint/muted link</a>
                        </p>
                    </div>

                    <div class="mb-4">
                        <h3 class="text-h6 mb-3">Navigation Links</h3>
                        <nav style="display: flex; gap: 24px">
                            <a href="#" class="nav-link">Home</a>
                            <a href="#" class="nav-link router-link-exact-active">Active Page</a>
                            <a href="#" class="nav-link">About</a>
                            <a href="#" class="nav-link">Contact</a>
                        </nav>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Badges & Tags Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Badges & Tags</h2>
                    <div class="section-divider mb-6"></div>

                    <div class="mb-4">
                        <h3 class="text-h6 mb-3">Status Badges</h3>
                        <div class="badge-group">
                            <span class="badge badge-default">Default</span>
                            <span class="badge badge-primary">Primary</span>
                            <span class="badge badge-success">Success</span>
                            <span class="badge badge-error">Error</span>
                            <span class="badge badge-warning">Warning</span>
                            <span class="badge badge-info">Info</span>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-h6 mb-3">Outlined Badges</h3>
                        <div class="badge-group">
                            <span class="badge badge-outlined">Outlined</span>
                            <span class="badge badge-outlined-primary">Primary</span>
                            <span class="badge badge-outlined-success">Success</span>
                            <span class="badge badge-outlined-error">Error</span>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Alerts Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Alerts & Messages</h2>
                    <div class="section-divider mb-6"></div>

                    <div class="alert alert-success mb-3">
                        <strong>Success!</strong> Your action was completed successfully.
                    </div>

                    <div class="alert alert-info mb-3">
                        <strong>Info:</strong> Here's some helpful information for you.
                    </div>

                    <div class="alert alert-warning mb-3">
                        <strong>Warning:</strong> Please review this before continuing.
                    </div>

                    <div class="alert alert-error mb-3">
                        <strong>Error:</strong> Something went wrong. Please try again.
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Spacing Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Spacing Scale</h2>
                    <div class="section-divider mb-6"></div>

                    <p class="mb-4">Consistent spacing creates visual rhythm and hierarchy.</p>

                    <v-row>
                        <v-col
                            v-for="space in spacingScale"
                            :key="space.name"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <div class="spacing-demo">
                                <div class="spacing-box" :style="{ padding: space.value }">
                                    <div class="spacing-inner">
                                        {{ space.name }}
                                    </div>
                                </div>
                                <div class="spacing-label">{{ space.value }}</div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>

        <!-- Loading States Section -->
        <v-row class="mb-8">
            <v-col cols="12">
                <div class="section-card">
                    <h2 class="text-h4 mb-4">Loading States</h2>
                    <div class="section-divider mb-6"></div>

                    <div class="mb-4">
                        <h3 class="text-h6 mb-3">Spinner</h3>
                        <div class="spinner"></div>
                    </div>

                    <div class="mb-4">
                        <h3 class="text-h6 mb-3">Skeleton Loader</h3>
                        <div
                            class="skeleton-loader"
                            style="width: 100%; height: 20px; margin-bottom: 8px"
                        ></div>
                        <div
                            class="skeleton-loader"
                            style="width: 80%; height: 20px; margin-bottom: 8px"
                        ></div>
                        <div class="skeleton-loader" style="width: 90%; height: 20px"></div>
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "DesignSystem",

    data() {
        return {
            primaryColors: [
                { name: "Primary Dark", value: "#1a1a1a", textColor: "#fff" },
                { name: "Primary", value: "#333", textColor: "#fff" },
                { name: "Primary Light", value: "#373737", textColor: "#fff" },
                { name: "Primary Lighter", value: "#4d4d4d", textColor: "#fff" },
            ],

            secondaryColors: [
                { name: "Secondary Dark", value: "#a5a7a9", textColor: "#333" },
                { name: "Secondary", value: "#bfc1c3", textColor: "#333" },
                { name: "Secondary Light", value: "#d9dadc", textColor: "#333" },
                { name: "Accent/White", value: "#ffffff", textColor: "#333" },
            ],

            systemColors: [
                { name: "Background", value: "rgb(240, 240, 240)", textColor: "#333" },
                { name: "Text", value: "#05101b", textColor: "#fff" },
                { name: "Error", value: "rgb(169, 6, 6)", textColor: "#fff" },
                { name: "Success", value: "#2d7a3e", textColor: "#fff" },
                { name: "Warning", value: "#c77700", textColor: "#fff" },
                { name: "Info", value: "#1a5c8a", textColor: "#fff" },
            ],

            typography: [
                {
                    name: "Heading 1",
                    cssClass: "text-h1",
                    class: "text-h1",
                    sample: "The quick brown fox",
                },
                {
                    name: "Heading 2",
                    cssClass: "text-h2",
                    class: "text-h2",
                    sample: "The quick brown fox",
                },
                {
                    name: "Heading 3",
                    cssClass: "text-h3",
                    class: "text-h3",
                    sample: "The quick brown fox",
                },
                {
                    name: "Heading 4",
                    cssClass: "text-h4",
                    class: "text-h4",
                    sample: "The quick brown fox",
                },
                {
                    name: "Heading 5",
                    cssClass: "text-h5",
                    class: "text-h5",
                    sample: "The quick brown fox",
                },
                {
                    name: "Heading 6",
                    cssClass: "text-h6",
                    class: "text-h6",
                    sample: "The quick brown fox",
                },
                {
                    name: "Body Regular",
                    cssClass: "body-text",
                    class: "body-text",
                    sample: "The quick brown fox jumps over the lazy dog",
                },
                {
                    name: "Body Small",
                    cssClass: "body-small",
                    class: "body-small",
                    sample: "The quick brown fox jumps over the lazy dog",
                },
                {
                    name: "Hint Text",
                    cssClass: "hint-text",
                    class: "hint-text",
                    sample: "The quick brown fox jumps over the lazy dog",
                },
            ],

            spacingScale: [
                { name: "XS", value: "4px" },
                { name: "Small", value: "8px" },
                { name: "Medium", value: "16px" },
                { name: "Large", value: "24px" },
                { name: "XL", value: "32px" },
                { name: "2XL", value: "48px" },
                { name: "3XL", value: "64px" },
                { name: "4XL", value: "96px" },
            ],
        };
    },
};
</script>

<style scoped>
.design-system {
    background-color: var(--global-containers-background-color);
    padding: 32px 16px;
    max-width: 1400px;
    margin: 0 auto;
}

/* Section Cards */
.section-card {
    background-color: #fff;
    border-radius: 4px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-divider {
    height: 1px;
    background-color: var(--secondary-color);
    opacity: 0.3;
}

/* Color Swatches */
.color-swatch {
    height: 120px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-name {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
}

.color-value {
    font-size: 12px;
    opacity: 0.8;
    font-family: monospace;
}

/* Button Groups */
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

/* Button Base Styles */
button {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: Avenir, Helvetica, Arial, sans-serif;
}

.btn-small {
    padding: 6px 14px;
    font-size: 13px;
}

.btn-large {
    padding: 14px 28px;
    font-size: 16px;
}

.icon-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Primary Button */
.primary-btn {
    background-color: var(--primary-color);
    color: var(--primary-btn-text-color);
    border-color: var(--primary-color);
}

.primary-btn:hover {
    background-color: var(--primary-color-lighter);
    border-color: var(--primary-color-lighter);
}

/* Secondary Button */
.secondary-btn {
    background-color: transparent;
    color: var(--text-color);
    border-color: var(--text-color);
}

.secondary-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

/* Text Button */
.text-btn {
    background-color: transparent;
    color: var(--text-color);
    border-color: transparent;
}

.text-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

/* Status Buttons */
.success-btn {
    background-color: #2d7a3e;
    color: #fff;
    border-color: #2d7a3e;
}

.success-btn:hover {
    background-color: #256630;
}

.error-btn {
    background-color: var(--error-color);
    color: #fff;
    border-color: var(--error-color);
}

.error-btn:hover {
    background-color: #b00505;
}

.warning-btn {
    background-color: #c77700;
    color: #fff;
    border-color: #c77700;
}

.warning-btn:hover {
    background-color: #a56200;
}

.info-btn {
    background-color: #1a5c8a;
    color: #fff;
    border-color: #1a5c8a;
}

.info-btn:hover {
    background-color: #144a70;
}

/* Disabled Button */
button.disabled,
button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
}

/* Typography */
.text-h1 {
    font-size: 3rem;
    font-weight: 300;
    line-height: 1.2;
}
.text-h2 {
    font-size: 2.5rem;
    font-weight: 300;
    line-height: 1.2;
}
.text-h3 {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.3;
}
.text-h4 {
    font-size: 1.75rem;
    font-weight: 400;
    line-height: 1.3;
}
.text-h5 {
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.4;
}
.text-h6 {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.4;
}
.body-text {
    font-size: 1rem;
    line-height: 1.6;
}
.body-small {
    font-size: 0.875rem;
    line-height: 1.5;
}

.type-code {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--secondary-color);
    font-family: monospace;
}

/* Cards */
.content-card {
    background-color: #fff;
    border-radius: 4px;
    padding: 24px;
    margin-bottom: 16px;
}

.elevation-1 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.elevation-2 {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.elevation-3 {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.outlined {
    border: 1px solid var(--secondary-color);
    box-shadow: none;
}

.dark-card {
    background-color: var(--primary-color);
}

.card-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--text-color);
}

.card-text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 16px;
    text-align: left;
}

.card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
}

/* Form Elements */
.form-group {
    margin-bottom: 20px;
    text-align: left;
}

.form-label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
}

.form-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    background-color: #fff;
    color: var(--text-color);
    font-family: Avenir, Helvetica, Arial, sans-serif;
    transition: border-color 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.form-input.error {
    border-color: var(--error-color);
}

.checkbox-label,
.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-color);
    cursor: pointer;
    margin-bottom: 8px;
}

.form-checkbox,
.form-radio {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

/* Links */
.default-link {
    color: var(--text-color);
    text-decoration: none;
}

.default-link:hover {
    text-decoration: underline;
}

.nav-link {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
}

.nav-link:hover {
    text-decoration: underline;
}

.nav-link.router-link-exact-active {
    text-decoration: underline;
}

/* Badges */
.badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 12px;
    line-height: 1.4;
}

.badge-default {
    background-color: var(--secondary-color);
    color: var(--text-color);
}

.badge-primary {
    background-color: var(--primary-color);
    color: #fff;
}

.badge-success {
    background-color: #2d7a3e;
    color: #fff;
}

.badge-error {
    background-color: var(--error-color);
    color: #fff;
}

.badge-warning {
    background-color: #c77700;
    color: #fff;
}

.badge-info {
    background-color: #1a5c8a;
    color: #fff;
}

.badge-outlined {
    background-color: transparent;
    border: 1px solid var(--secondary-color);
    color: var(--text-color);
}

.badge-outlined-primary {
    background-color: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
}

.badge-outlined-success {
    background-color: transparent;
    border: 1px solid #2d7a3e;
    color: #2d7a3e;
}

.badge-outlined-error {
    background-color: transparent;
    border: 1px solid var(--error-color);
    color: var(--error-color);
}

/* Alerts */
.alert {
    padding: 16px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
}

.alert-success {
    background-color: #e8f5e9;
    border-left: 4px solid #2d7a3e;
    color: #1b5e20;
}

.alert-info {
    background-color: #e3f2fd;
    border-left: 4px solid #1a5c8a;
    color: #0d47a1;
}

.alert-warning {
    background-color: #fff3e0;
    border-left: 4px solid #c77700;
    color: #e65100;
}

.alert-error {
    background-color: #ffebee;
    border-left: 4px solid var(--error-color);
    color: #b71c1c;
}

/* Spacing Demo */
.spacing-demo {
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    overflow: hidden;
}

.spacing-box {
    background-color: var(--primary-color);
}

.spacing-inner {
    background-color: #fff;
    padding: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
}

.spacing-label {
    text-align: center;
    padding: 8px;
    font-size: 12px;
    color: var(--secondary-color);
    background-color: #fafafa;
}

/* Loading States */
.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--secondary-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.skeleton-loader {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s ease-in-out infinite;
    border-radius: 4px;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>

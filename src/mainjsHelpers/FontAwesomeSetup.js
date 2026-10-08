// Taking this code out of the main.js file to declutter it.
// To revert back simply transfer everything except the export line "export { FontAwesomeIcon };"
// back to main.js

import { library } from "@fortawesome/fontawesome-svg-core"; // FontAwesome core
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"; /* FontAwesome component */
import {
    faUser,
    faCartShopping,
    faBars,
    faChevronDown,
    faRuler,
    faArrowLeft,
    faTrashCan,
    faCreditCard,
    faKey,
    faArrowRightFromBracket,
    faPlus,
    faMinus,
    faXmark,
    faArrowRight,
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons"; /* FontAwesome import individual icons */
// import { fas } from '@fortawesome/free-solid-svg-icons' /* FontAwesome import all icons */

library.add(
    faUser,
    faCartShopping,
    faBars,
    faChevronDown,
    faRuler,
    faArrowLeft,
    faTrashCan,
    faCreditCard,
    faKey,
    faArrowRightFromBracket,
    faPlus,
    faMinus,
    faXmark,
    faArrowRight,
    faBoxOpen,
); /* add individual icons to the library */

export { FontAwesomeIcon };

/*  example usage:

<div class="action-btn" @click="showQuantityNumpad = !showQuantityNumpad">
<font-awesome-icon class="icon-pad-right" icon="hashtag" />Change Quantity
</div>

*/

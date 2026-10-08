export const appConfig = {
    prodHasDiffSizes: ["Mens T-shirts", "Womens T-shirts"],
    globalContactEmail: "support@nevyzmojen.com", // remember to update email in functions/index.js too and deploy those again as these are separate. Also ensure in brevo you add a new sender.
    contactNumber: "+359 777777788",
    globalCommunications_Email: true, // Set to true to enable global communications email functionality
    // Show "X left" warning when a size's stock falls below this number
    lowStockThreshold: 5,
    // Canonical display order for garment sizes across the whole app
    sizeOrder: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
};

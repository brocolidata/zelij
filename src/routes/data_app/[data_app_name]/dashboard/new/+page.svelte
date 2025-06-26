<script>
    import { page } from "$app/state";
    import EditDashboard from "$custom_ui/pages/edit_dashboard.svelte";
    import { createDashboard, addDashboardToDataApp } from "$lib/zelij_utils/stores";

    let dataAppName = page.params.data_app_name;
    let dashboardName = $state("");

    function saveDashboard(dashboardState) {
        dashboardName = dashboardState.name;
        createDashboard(dashboardState);
        addDashboardToDataApp(dataAppName, dashboardName);
    }
</script>

<EditDashboard 
    {dataAppName}
    onSave={(dashboardState) => {saveDashboard(dashboardState)}}
/>
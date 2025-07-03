<script>
    import { page } from "$app/state";
    import EditDashboard from "$custom_ui/pages/edit_dashboard.svelte";
    import { updateDashboard } from "$lib/zelij_utils/stores";

    let dataAppName = page.params.data_app_name;
    let dashboardName = page.params.dashboard_name;

    function saveDashboard(dashboardState) {
        updateDashboard(dashboardName, dashboardState);
    }
</script>

<EditDashboard 
    {dashboardName}
    {dataAppName}
    onSave={(dashboardState) => {saveDashboard(dashboardState)}}
/>
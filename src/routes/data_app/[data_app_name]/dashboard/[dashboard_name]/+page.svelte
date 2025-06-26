<script>
    import { page } from "$app/state";
    import { base } from "$app/paths";
    import DisplayDashboard from "$custom_ui/pages/display_dashboard.svelte";

    let dashboardName = page.params.dashboard_name;
    let dataAppName = page.params.data_app_name;
    let editURL = `${base}/data_app/${dataAppName}/dashboard/${dashboardName}/edit`
</script>

<DisplayDashboard
    {dashboardName}
    {dataAppName}
    {editURL}
/>
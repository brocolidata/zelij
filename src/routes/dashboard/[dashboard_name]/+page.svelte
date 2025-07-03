<script>
    import { page } from "$app/state";
    import DisplayDashboard from "$custom_ui/pages/display_dashboard.svelte";
    import { base } from '$app/paths';

    let dashboardName = page.params.dashboard_name;
    let editURL = `${base}/dashboard/${dashboardName}/edit`
</script>

<DisplayDashboard
    {dashboardName}
    {editURL}
/>
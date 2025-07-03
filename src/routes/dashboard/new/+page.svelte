<script>
    import EditDashboard from "$custom_ui/pages/edit_dashboard.svelte";
    import { createDashboard } from "$lib/zelij_utils/stores";
    
    function saveDashboard(dashboardState) {
        createDashboard(dashboardState);
    }

</script>

<EditDashboard 
    onSave={(dashboardState) => {saveDashboard(dashboardState)}}
/>
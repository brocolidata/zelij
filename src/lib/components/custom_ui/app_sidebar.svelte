<script>
    import { base } from '$app/paths';
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    import { getDashboards, getDataSources } from "$lib/zelij_utils/zelij_config";

    let activeSection = $state('section-')

    function setActiveSection(sectionGroup, section) {
        activeSection = `section-${sectionGroup}-${section}`;
    }

    function sectionIsActive(sectionGroup, section) {
        return activeSection === `section-${sectionGroup}-${section}`;
    }
    
    const dashboards = getDashboards();
    const dataSources = getDataSources();
</script>

<Sidebar.Root>
    <Sidebar.Header>
    </Sidebar.Header>
    <div class="pt-10"></div>
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Dashboards</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each dashboards as dashboard}
                        <Sidebar.MenuItem>

                            <Sidebar.MenuButton 
                                onclick={() => setActiveSection("dashboards", dashboard.name)} 
                                active={sectionIsActive("dashboards", dashboard.name)}
                            >
                                {#snippet child({ props })}
                                    <a href="{base}/dashboard/{dashboard.name}" {...props}>
                                        <span>{dashboard.label}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Data Sources</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each dataSources as source}
                        <Sidebar.MenuItem>

                            <Sidebar.MenuButton 
                                onclick={() => setActiveSection("sources", source.name)} 
                                active={sectionIsActive("dashboards", source.name)}
                            >
                                {#snippet child({ props })}
                                    <a href="{base}/data_source/{source.name}" {...props}>
                                        <span>{source.label}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
    </Sidebar.Footer>
</Sidebar.Root>

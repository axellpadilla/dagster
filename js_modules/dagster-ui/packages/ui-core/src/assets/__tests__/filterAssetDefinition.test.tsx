import {
  AssetFilterBaseType,
  AssetFilterType,
  FilterableAssetDefinition,
  filterAssetDefinition,
} from 'shared/assets/useAssetDefinitionFilterState.oss';

import {
  ChangeReason,
  StaleStatus,
  buildAssetGroupSelector,
  buildDefinitionTag,
  buildRepository,
  buildRepositoryLocation,
  buildTeamAssetOwner,
} from '../../graphql/types';

describe('filterAssetDefinition', () => {
  it('returns false when no definition is provided', () => {
    const filters = {
      codeLocations: [{location: 'location1', name: 'repo1'}],
    };
    expect(filterAssetDefinition(filters, null)).toBe(false);
  });

  it('returns false when repo filters do not match and definition exists', () => {
    const filters = {
      codeLocations: [{location: 'location2', name: 'repo2'}],
    };
    const definition = {
      repository: {location: {name: 'location1'}, name: 'repo1'},
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns false when group filters are provided but no definition', () => {
    const filters = {
      groups: [
        buildAssetGroupSelector({
          groupName: 'test',
          repositoryLocationName: 'test',
          repositoryName: 'test',
        }),
      ],
    };
    expect(filterAssetDefinition(filters, null)).toBe(false);
  });

  it('returns false when group filters do not match the definition group', () => {
    const filters = {
      groups: [
        buildAssetGroupSelector({
          groupName: 'test',
          repositoryLocationName: 'test',
          repositoryName: 'test',
        }),
      ],
    };
    const definition = {};
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns false when kinds filter does not match the definition', () => {
    const filters = {
      kinds: ['computeKind2'],
    };
    const definition = {
      kinds: ['computeKind1'],
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns false when changedInBranch filter is provided but definition does not have matching changed reasons', () => {
    const filters = {
      changedInBranch: [ChangeReason.DEPENDENCIES],
    };
    const definition = {
      changedReasons: [ChangeReason.CODE_VERSION],
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns false when owners filter does not match any of the definition owners', () => {
    const filters = {
      owners: [
        buildTeamAssetOwner({
          team: 'team1',
        }),
      ],
    };
    const definition = {
      owners: [
        buildTeamAssetOwner({
          team: 'team2',
        }),
      ],
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns false when tags filter does not match definition tags', () => {
    const filters = {
      tags: [
        buildDefinitionTag({
          key: 'test',
          value: 'test',
        }),
      ],
    };
    const definition = {
      tags: [
        buildDefinitionTag({
          key: 'test2',
          value: 'test2',
        }),
      ],
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns true when filters are empty (no filtering applied)', () => {
    const filters = {};
    const definition = {
      // Definition with any set of properties
    };
    expect(filterAssetDefinition(filters, definition)).toBe(true);
  });

  it('returns true when all provided filters exactly match the definition', () => {
    const tag = buildDefinitionTag({
      key: 'test',
      value: 'test',
    });
    const group = buildAssetGroupSelector({
      groupName: 'groupName',
      repositoryLocationName: 'repositoryLocationName',
      repositoryName: 'repositoryName',
    });
    const repo = {
      location: group.repositoryLocationName,
      name: group.repositoryName,
    };
    const owner = buildTeamAssetOwner({
      team: 'team1',
    });
    const filters = {
      codeLocations: [repo],
      groups: [group],
      kinds: ['computeKind1'],
      changedInBranch: [ChangeReason.DEPENDENCIES, ChangeReason.PARTITIONS_DEFINITION],
      owners: [owner],
      tags: [tag],
    };
    const definition = {
      repository: buildRepository({
        name: group.repositoryName,
        location: buildRepositoryLocation({
          name: group.repositoryLocationName,
        }),
      }),
      groupName: group.groupName,
      kinds: ['computeKind1'],
      changedReasons: [ChangeReason.DEPENDENCIES, ChangeReason.PARTITIONS_DEFINITION],
      owners: [owner],
      tags: [tag],
    };

    expect(filterAssetDefinition(filters, definition)).toBe(true);
  });

  it('does case in-sensitive matching', () => {
    const tag = buildDefinitionTag({
      key: 'test',
      value: 'test',
    });
    const group = buildAssetGroupSelector({
      groupName: 'groupName',
      repositoryLocationName: 'repositoryLocationName',
      repositoryName: 'repositoryName',
    });
    const repo = {
      location: group.repositoryLocationName,
      name: group.repositoryName,
    };
    const owner = buildTeamAssetOwner({
      team: 'team1',
    });
    const filters = {
      codeLocations: [repo],
      groups: [
        {
          ...group,
          groupName: group.groupName.toUpperCase(),
        },
      ],
      kinds: ['COMPUTEkind1'],
      changedInBranch: [ChangeReason.DEPENDENCIES, ChangeReason.PARTITIONS_DEFINITION],
      owners: [
        {
          ...owner,
          team: owner.team.toUpperCase(),
        },
      ],
      tags: [{...tag, key: tag.key.toUpperCase(), value: tag.value.toUpperCase()}],
    };
    const definition = {
      repository: buildRepository({
        name: group.repositoryName,
        location: buildRepositoryLocation({
          name: group.repositoryLocationName,
        }),
      }),
      groupName: group.groupName,
      kinds: ['computeKind1'],
      changedReasons: [ChangeReason.DEPENDENCIES, ChangeReason.PARTITIONS_DEFINITION],
      owners: [owner],
      tags: [tag],
    };

    expect(filterAssetDefinition(filters, definition)).toBe(true);
  });

  it('returns false when staleStatus filter does not match definition status', () => {
    const filters = {
      staleStatuses: [StaleStatus.FRESH],
    };
    const definition = {
      staleStatus: StaleStatus.STALE,
    };
    expect(filterAssetDefinition(filters, definition)).toBe(false);
  });

  it('returns true when staleStatus filter matches definition status', () => {
    const filters = {
      staleStatuses: [StaleStatus.STALE, StaleStatus.FRESH],
    };
    const definition = {
      staleStatus: StaleStatus.STALE,
    };
    expect(filterAssetDefinition(filters, definition)).toBe(true);
  });

  it('filters using selectAllFilter: staleStatuses', () => {
    const filters: Partial<AssetFilterType> = {
      selectAllFilters: ['staleStatuses'],
    };
    const definition = {
      staleStatus: StaleStatus.FRESH,
    };
    expect(filterAssetDefinition(filters, definition)).toBe(true);
  });

  (
    ['changedInBranch', 'kinds', 'groups', 'owners', 'codeLocations', 'tags'] as Array<
      keyof AssetFilterBaseType
    >
  ).forEach((filter) => {
    it(`filters using selectAllFilter: ${filter}`, async () => {
      const tag = buildDefinitionTag({
        key: 'test',
        value: 'test',
      });
      const group = buildAssetGroupSelector({
        groupName: 'groupName',
        repositoryLocationName: 'repositoryLocationName',
        repositoryName: 'repositoryName',
      });
      const owner = buildTeamAssetOwner({
        team: 'team1',
      });
      const filters: Partial<AssetFilterType> = {
        selectAllFilters: [filter],
      };
      const definition: FilterableAssetDefinition = {
        repository: buildRepository({
          name: group.repositoryName,
          location: buildRepositoryLocation({
            name: group.repositoryLocationName,
          }),
        }),
        groupName: group.groupName,
        kinds: ['computeKind1'],
        changedReasons: [ChangeReason.DEPENDENCIES, ChangeReason.PARTITIONS_DEFINITION],
        owners: [owner],
        tags: [tag],
      };

      expect(filterAssetDefinition(filters, definition)).toBe(true);
    });
  });
});

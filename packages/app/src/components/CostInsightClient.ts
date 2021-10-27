/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  This is a copy-pastable client template to get up and running quickly.
  API Reference:
  https://github.com/backstage/backstage/blob/master/plugins/cost-insights/src/api/CostInsightsApi.ts
*/

// IMPORTANT: Remove the lines below to enable type checking and linting
// @ts-nocheck
/* eslint-disable import/no-extraneous-dependencies */

import {
  CostInsightsApi,
  ProductInsightsOptions,
  Alert,
  Cost,
  Entity,
  Group,
  MetricData,
  Project,
} from '@backstage/plugin-cost-insights';
import { DateTime, Duration as LuxonDuration } from 'luxon';
import regression, { DataPoint } from 'regression';

enum Duration {
  P7D = 'P7D',
  P30D = 'P30D',
  P90D = 'P90D',
  P3M = 'P3M',
}

const getGroupedProducts = (intervals: string) => [
  // {
  //   id: 'Cloud Dataflow',
  //   aggregation: aggregationFor(intervals, 1_700),
  // },
  // {
  //   id: 'Compute Engine',
  //   aggregation: aggregationFor(intervals, 350),
  // },
  // {
  //   id: 'Cloud Storage',
  //   aggregation: aggregationFor(intervals, 1_300),
  // },
  // {
  //   id: 'BigQuery',
  //   aggregation: aggregationFor(intervals, 2_000),
  // },
  // {
  //   id: 'Cloud SQL',
  //   aggregation: aggregationFor(intervals, 750),
  // },
  // {
  //   id: 'Cloud Spanner',
  //   aggregation: aggregationFor(intervals, 50),
  // },
  // {
  //   id: 'Cloud Pub/Sub',
  //   aggregation: aggregationFor(intervals, 1_000),
  // },
  // {
  //   id: 'Cloud Bigtable',
  //   aggregation: aggregationFor(intervals, 250),
  // },
  {
    id: 'Events',
    aggregation: aggregationFor(intervals, 1_000),
  },
];

const getGroupedProjects = (intervals: string) => [
  {
    id: 'project-a',
    aggregation: aggregationFor(intervals, 1_700),
  },
  {
    id: 'project-b',
    aggregation: aggregationFor(intervals, 350),
  },
  {
    id: 'project-c',
    aggregation: aggregationFor(intervals, 1_300),
  },
];

const DEFAULT_DATE_FORMAT = 'yyyy-LL-dd';

function inclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  return DateTime.fromISO(exclusiveEndDateOf(duration, inclusiveEndDate))
    .minus({ days: 1 })
    .toFormat(DEFAULT_DATE_FORMAT);
}

function changeOf(aggregation: DateAggregation[]): ChangeStatistic {
  const firstAmount = aggregation.length ? aggregation[0].amount : 0;
  const lastAmount = aggregation.length
    ? aggregation[aggregation.length - 1].amount
    : 0;

  // if either the first or last amounts are zero, the rate of increase/decrease is infinite
  if (!firstAmount || !lastAmount) {
    return {
      amount: lastAmount - firstAmount,
    };
  }

  return {
    ratio: (lastAmount - firstAmount) / firstAmount,
    amount: lastAmount - firstAmount,
  };
}

function trendlineOf(aggregation: DateAggregation[]): Trendline {
  const data: ReadonlyArray<DataPoint> = aggregation.map(a => [
    Date.parse(a.date) / 1000,
    a.amount,
  ]);
  const result = regression.linear(data, { precision: 5 });
  return {
    slope: result.equation[0],
    intercept: result.equation[1],
  };
}

const MockEventsInsights: Entity = {
  id: 'events',
  aggregation: [20_000, 10_000, 5_000],
  change: {
    ratio: -0.5,
    amount: -10_000,
  },
  entities: {
    event: [
      {
        id: 'event-a',
        aggregation: [15_000, 9_000, 5_000],
        change: {
          ratio: -0.53333333333,
          amount: -8_000,
        },
        entities: {
          product: [
            {
              id: 'Mock Product A',
              aggregation: [5_000, 2_000, 8_000],
              change: {
                ratio: -0.21,
                amount: -3_000,
              },
              entities: {},
            },
            {
              id: 'Mock Product B',
              aggregation: [7_000, 2_500],
              change: {
                ratio: -0.64285714285,
                amount: -4_500,
              },
              entities: {},
            },
            {
              id: 'Mock Product C',
              aggregation: [3_000, 2_500],
              change: {
                ratio: -0.16666666666,
                amount: -500,
              },
              entities: {},
            },
          ],
        },
      },
      {
        id: 'event-b',
        aggregation: [5_000, 3_000],
        change: {
          ratio: -0.4,
          amount: -2_000,
        },
        entities: {
          product: [
            {
              id: 'Mock Product A',
              aggregation: [2_000, 1_000],
              change: {
                ratio: -0.5,
                amount: -1_000,
              },
              entities: {},
            },
            {
              id: 'Mock Product B',
              aggregation: [1_000, 1_500],
              change: {
                ratio: 0.5,
                amount: 500,
              },
              entities: {},
            },
            {
              id: 'Mock Product C',
              aggregation: [2_000, 500],
              change: {
                ratio: -0.75,
                amount: -1_500,
              },
              entities: {},
            },
          ],
        },
      },
    ],
  },
};

export function entityOf(product: string): Entity {
  switch (product) {
    case 'computeEngine':
      return MockComputeEngineInsights;
    case 'cloudDataflow':
      return MockCloudDataflowInsights;
    case 'cloudStorage':
      return MockCloudStorageInsights;
    case 'bigQuery':
      return MockBigQueryInsights;
    case 'events':
      return MockEventsInsights;
    default:
      throw new Error(
        `Cannot get insights for ${product}. Make sure product matches product property in app-info.yaml`,
      );
  }
}

function inclusiveStartDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(inclusiveEndDate)
        .startOf('quarter')
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    default:
      return assertNever(duration);
  }
}

function exclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(quarterEndDate(inclusiveEndDate))
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    default:
      return assertNever(duration);
  }
}

function parseIntervals(intervals: string): IntervalFields {
  const match = intervals.match(
    /\/(?<duration>P\d+[DM])\/(?<date>\d{4}-\d{2}-\d{2})/,
  );
  if (Object.keys(match?.groups || {}).length !== 2) {
    throw new Error(`Invalid intervals: ${intervals}`);
  }
  const { duration, date } = match!.groups!;
  return {
    duration: duration as Duration,
    endDate: date,
  };
}

function aggregationFor(intervals: string, baseline: number): any[] {
  const { duration, endDate } = parseIntervals(intervals);
  const inclusiveEndDate = inclusiveEndDateOf(duration, endDate);
  const days = DateTime.fromISO(endDate).diff(
    DateTime.fromISO(inclusiveStartDateOf(duration, inclusiveEndDate)),
    'days',
  );

  function nextDelta(): number {
    const varianceFromBaseline = 0.15;
    // Let's give positive vibes in trendlines - higher change for positive delta with >0.5 value
    const positiveTrendChance = 0.55;
    const normalization = positiveTrendChance - 1;
    return baseline * (Math.random() + normalization) * varianceFromBaseline;
  }

  return [...Array(days).keys()].reduce(
    (values: DateAggregation[], i: number): DateAggregation[] => {
      const last = values.length ? values[values.length - 1].amount : baseline;
      const date = DateTime.fromISO(
        inclusiveStartDateOf(duration, inclusiveEndDate),
      )
        .plus({ days: i })
        .toFormat(DEFAULT_DATE_FORMAT);
      const amount = Math.max(0, last + nextDelta());
      values.push({
        date: date,
        amount: amount,
      });
      return values;
    },
    [],
  );
}

export class CostInsightsClient implements CostInsightsApi {
  private request(_: any, res: any): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 0, res));
  }

  async getLastCompleteBillingDate(): Promise<string> {
    return '2021-09-01'; // YYYY-MM-DD
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const groups: Group[] = await this.request({ userId }, [
      { id: 'kerberus' },
    ]);

    return groups;
  }

  async getGroupProjects(group: string): Promise<Project[]> {
    const projects: Project[] = await this.request({ group }, [
      { id: 'battle-royale' },
    ]);

    return projects;
  }

  async getAlerts(group: string): Promise<Alert[]> {
    return [];
  }

  async getDailyMetricData(
    metric: string,
    intervals: string,
  ): Promise<MetricData> {
    // return {
    //   id: 'remove-me',
    //   format: 'number',
    //   aggregation: [],
    //   change: {
    //     ratio: 0,
    //     amount: 0,
    //   },
    // };
    const aggregation = aggregationFor(intervals, 100_000).map(entry => ({
      ...entry,
      amount: Math.round(entry.amount),
    }));

    const cost: MetricData = await this.request(
      { metric, intervals },
      {
        format: 'number',
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
      },
    );

    return cost;
  }

  async getGroupDailyCost(group: string, intervals: string): Promise<Cost> {
    // return {
    //   id: 'remove-me',
    //   aggregation: [],
    //   change: {
    //     ratio: 0,
    //     amount: 0,
    //   },
    // };
    const aggregation = aggregationFor(intervals, 8_000);
    const groupDailyCost: Cost = await this.request(
      { group, intervals },
      {
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
        // Optional field providing cost groupings / breakdowns keyed by the type. In this example,
        // daily cost grouped by cloud product OR by project / billing account.
        groupedCosts: {
          product: getGroupedProducts(intervals),
          project: getGroupedProjects(intervals),
        },
      },
    );

    return groupDailyCost;
  }

  async getProjectDailyCost(project: string, intervals: string): Promise<Cost> {
    // return {
    //   id: 'remove-me',
    //   aggregation: [],
    //   change: {
    //     ratio: 0,
    //     amount: 0,
    //   },
    // };
    const aggregation = aggregationFor(intervals, 1_500);
    const projectDailyCost: Cost = await this.request(
      { project, intervals },
      {
        id: 'project-a',
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
        // Optional field providing cost groupings / breakdowns keyed by the type. In this example,
        // daily project cost grouped by cloud product.
        groupedCosts: {
          product: getGroupedProducts(intervals),
        },
      },
    );

    return projectDailyCost;
  }

  async getProductInsights(options: ProductInsightsOptions): Promise<Entity> {
    // return {
    //   id: 'remove-me',
    //   aggregation: [0, 0],
    //   change: {
    //     ratio: 0,
    //     amount: 0,
    //   },
    //   entities: {},
    // };
    const productInsights: Entity = await this.request(
      options,
      entityOf(options.product),
    );

    return productInsights;
  }
}

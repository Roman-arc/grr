import {ChangeDetectionStrategy, Component} from '@angular/core';
import {OsqueryFlowArgs, OsqueryProgress, OsqueryResult} from '@app/lib/api/api_interfaces';
import {FlowState} from '@app/lib/models/flow';
import {isNonNull} from '@app/lib/preconditions';
import {combineLatest, concat, Observable} from 'rxjs';
import {filter, map, startWith, takeUntil} from 'rxjs/operators';

import {FlowResultsLocalStore} from '../../../store/flow_results_local_store';

import {Plugin} from './plugin';

/**
 * Component that displays the details (status, errors, results) for a
 * particular Osquery Flow.
 */
@Component({
  selector: 'osquery-details',
  templateUrl: './osquery_details.ng.html',
  styleUrls: ['./osquery_details.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsqueryDetails extends Plugin {
  readonly flowError$ = this.flagByState(FlowState.ERROR);
  readonly flowRunning$ = this.flagByState(FlowState.RUNNING);
  readonly flowCompleted$ = this.flagByState(FlowState.FINISHED);

  private readonly osqueryResults$: Observable<OsqueryResult> =
      this.flowResultsLocalStore.results$.pipe(
          map(results => results[0]?.payload as OsqueryResult),
          filter(isNonNull));

  private readonly osqueryProgress$: Observable<OsqueryProgress> =
      this.flow$.pipe(
          map(flow => flow.progress as OsqueryProgress),
          filter(isNonNull),
      );

  private readonly resultsTable$ = this.osqueryResults$.pipe(
      map(result => result.table),
      filter(isNonNull),
  );

  private readonly progressTable$ = this.osqueryProgress$.pipe(
      map(progress => progress.partialTable),
      filter(isNonNull),
  );

  readonly displayTable$ = concat(
      this.progressTable$.pipe(takeUntil(this.resultsTable$)),
      this.resultsTable$,
  );

  readonly progressErrorMessage$ = this.osqueryProgress$.pipe(
      map(progress => progress.errorMessage),
      filter(isNonNull),
  );

  readonly additionalRowsAvailable$ =
      combineLatest([
        this.osqueryProgress$.pipe(
            map(progress => progress.totalRowCount),
            startWith(null),
            ),
        this.displayTable$.pipe(
            map(table => table.rows?.length),
            startWith(null),
            ),
      ])
          .pipe(
              map(([totalRowCount, displayedRowCount]) => {
                if (isNonNull(totalRowCount) && Number(totalRowCount) === 0) {
                  // Without this check the button for requesting full results
                  // will be displayed if the resulting table is empty. This is
                  // because the table property of OsqueryTable is undefined if
                  // the result contains no rows.
                  return 0;
                }

                if (isNonNull(totalRowCount) && isNonNull(displayedRowCount)) {
                  return Number(totalRowCount) - displayedRowCount;
                }

                return '?';
              }),
          );

  readonly args$: Observable<OsqueryFlowArgs> = this.flow$.pipe(
      map(flow => flow.args as OsqueryFlowArgs),
  );

  readonly clientAndFlowId$ = this.flow$.pipe(
      map(flow => {
        const {clientId, flowId} = flow;

        if (clientId && flowId) {
          return {
            clientId,
            flowId,
          };
        } else {
          return null;
        }
      }),
      filter(isNonNull),
  );

  readonly exportCsvLink$ = this.clientAndFlowId$.pipe(
      map(ids => {
        return `/api/clients/${ids.clientId}/flows/${
            ids.flowId}/osquery-results/CSV`;
      }),
  );

  readonly collectedFilesLink$ = this.clientAndFlowId$.pipe(
      map(ids => {
        return `/api/clients/${ids.clientId}/flows/${
            ids.flowId}/results/files-archive`;
      }),
  );

  readonly numberOfRowsAvailable$ = this.displayTable$.pipe(
      map(table => table.rows?.length),
  );

  private flagByState(targetState: FlowState): Observable<boolean> {
    return this.flow$.pipe(map(flow => flow.state === targetState));
  }

  constructor(
      private readonly flowResultsLocalStore: FlowResultsLocalStore,
  ) {
    super();
    this.flowResultsLocalStore.query(
        this.flow$.pipe(map(flow => ({flow, withType: 'OsqueryResult'}))));
  }

  loadCompleteResults() {
    // TODO(user): Fetch more chunks if present
    this.flowResultsLocalStore.queryMore(1);
  }
}

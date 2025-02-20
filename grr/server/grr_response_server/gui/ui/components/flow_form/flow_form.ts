import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {map, startWith, takeUntil, withLatestFrom} from 'rxjs/operators';

import {ClientPageGlobalStore} from '../../store/client_page_global_store';
import {FlowArgsForm} from '../flow_args_form/flow_args_form';

/**
 * Component that allows selecting, configuring, and starting a Flow.
 */
@Component({
  selector: 'flow-form',
  templateUrl: './flow_form.ng.html',
  styleUrls: ['./flow_form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowForm implements OnInit, OnDestroy, AfterViewInit {
  private readonly unsubscribe$ = new Subject<void>();

  readonly selectedFD$ = this.clientPageGlobalStore.selectedFlowDescriptor$;

  @ViewChild('form') form!: ElementRef<HTMLFormElement>;

  @ViewChild(FlowArgsForm) flowArgsForm!: FlowArgsForm;

  readonly disabled$ = new Subject<boolean>();

  readonly error$ = this.clientPageGlobalStore.startFlowState$.pipe(
      map(state => state.state === 'error' ? state.error : undefined));

  readonly hasAccess$ =
      this.clientPageGlobalStore.hasAccess$.pipe(startWith(false));

  constructor(
      private readonly clientPageGlobalStore: ClientPageGlobalStore,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    fromEvent(this.form.nativeElement, 'submit')
        .pipe(
            takeUntil(this.unsubscribe$),
            withLatestFrom(this.flowArgsForm.flowArgValues$, this.hasAccess$),
            )
        .subscribe(([e, flowArgs, hasApproval]) => {
          e.preventDefault();

          if (hasApproval) {
            this.clientPageGlobalStore.startFlow(flowArgs);
          } else {
            this.clientPageGlobalStore.scheduleFlow(flowArgs);
          }
        });

    this.flowArgsForm.valid$.pipe(takeUntil(this.unsubscribe$))
        .subscribe(valid => {
          this.disabled$.next(!valid);
        });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

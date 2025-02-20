import {ChangeDetectionStrategy, Component} from '@angular/core';
import {UserGlobalStore} from '@app/store/user_global_store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/** Component that displays executed Flows on the currently selected Client. */
@Component({
  selector: 'user-menu',
  templateUrl: './user_menu.ng.html',
  styleUrls: ['./user_menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenu {
  readonly currentUsername$: Observable<string> =
      this.userGlobalStore.currentUser$.pipe(map(user => user.name));

  constructor(private readonly userGlobalStore: UserGlobalStore) {}
}

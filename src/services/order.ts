import IOrder from 'interfaces/models/order';
import IUserRole from 'interfaces/models/userRole';
import { IPaginationParams, IPaginationResponse } from 'interfaces/pagination';
import * as Rx from 'rxjs';
import * as RxOp from 'rxjs-operators';

import apiService, { ApiService } from './api';

export class OrderService {
  constructor(private apiService: ApiService) { }

  public list(params: IPaginationParams): Rx.Observable<IPaginationResponse<IOrder>> {
    return this.apiService.get('api/admin/order', params);
  }

  public save(model: IOrder): Rx.Observable<IOrder> {
    return this.apiService.post('api/admin/order', model);
  }

  public delete(id: number): Rx.Observable<void> {
    return this.apiService.delete(`api/admin/order/${id}`);
  }

  public roles(refresh: boolean = false): Rx.Observable<IUserRole[]> {
    return this.apiService.get('api/admin/user/roles').pipe(
      RxOp.cache('user-service-roles', { refresh }),
      RxOp.map(({ data }) => data)
    );
  }

}

const orderService = new OrderService(apiService);
export default orderService;

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import FormValidation from '@react-form-fields/material-ui/components/FormValidation';
import FieldText from '@react-form-fields/material-ui/components/Text';
import { FormComponent, IStateForm } from 'components/Abstract/Form';
import ErrorMessage from 'components/Shared/ErrorMessage';
import Toast from 'components/Shared/Toast';
import { WithStyles } from 'decorators/withStyles';
import IOrder from 'interfaces/models/order';
import IUserRole from 'interfaces/models/userRole';
import React, { Fragment } from 'react';
import * as RxOp from 'rxjs-operators';
import orderService from 'services/order';

interface IState extends IStateForm<IOrder> {
  loading: boolean;
  roles: Array<IUserRole & { selected?: boolean }>;
  error?: null;
}

interface IProps {
  opened: boolean;
  order?: IOrder;
  onComplete: (order: IOrder) => void;
  onCancel: () => void;
  classes?: any;
}

@WithStyles({
  content: {
    width: 400,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
})
export default class OrderFormDialog extends FormComponent<IProps, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      ...this.state,
      roles: [],
      loading: true
    };
  }

  get isEdit(): boolean {
    return !!this.state.model.id;
  }

  handleEnter = () => {
    const { order } = this.props;
    this.setState({ model: order || { quantity: 1, price: 0 } });
    this.loadData();
  };

  handleExit = () => {
    this.resetForm();

    const roles = this.state.roles.map(r => ({ ...r, selected: false }));
    this.setState({ roles });
  };

  loadData = () => {
    this.setState({ loading: true, error: null });

    orderService
      .roles()
      .pipe(
        RxOp.logError(),
        RxOp.bindComponent(this)
      )
      .subscribe(
        () => {
          this.setState({
            loading: false
          });
        },
        error => {
          this.setState({ loading: false, error });
        }
      );
  };

  onSubmit = (isValid: boolean) => {
    if (!isValid) return;

    const { model } = this.state;
    const { onComplete } = this.props;

    this.setState({ loading: true });
    orderService
      .save(model as IOrder)
      .pipe(
        RxOp.logError(),
        RxOp.bindComponent(this)
      )
      .subscribe(
        order => {
          Toast.show(`${order.description} foi salvo`);
          this.setState({ loading: false });

          onComplete(order);
        },
        err => {
          Toast.error(err.message === 'email-unavailable' ? 'Email já utlizado' : err);
          this.setState({ loading: false });
        }
      );
  };

  render() {
    const { model, loading, error } = this.state;
    const { opened, classes, onCancel } = this.props;

    return (
      <Dialog
        open={opened}
        disableBackdropClick
        disableEscapeKeyDown
        onEnter={this.handleEnter}
        onExited={this.handleExit}
        TransitionComponent={Transition}
      >
        {loading && <LinearProgress color='secondary' />}

        <FormValidation onSubmit={this.onSubmit} ref={this.bindForm}>
          <DialogTitle>{this.isEdit ? 'Editar' : 'Novo'} Pedido</DialogTitle>
          <DialogContent className={classes.content}>
            {error && <ErrorMessage error={error} tryAgain={this.loadData} />}

            {!error && (
              <Fragment>
                <FieldText
                  label='Descrição'
                  disabled={loading}
                  value={model.description}
                  validation='required|min:3|max:50'
                  onChange={this.updateModel((model, v) => (model.description = v))}
                />

                <FieldText
                  label='Quantidade'
                  disabled={loading}
                  value={model.quantity}
                  validation='required|numeric|min:1|max:100'
                  type='number'
                  onChange={this.updateModel((model, v) => (model.quantity = v))}
                />

                <FieldText
                  label='Valor'
                  mask='money'
                  disabled={loading}
                  value={model.price}
                  onChange={this.updateModel((model, v) => (model.price = v))}
                />
              </Fragment>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button color='secondary' type='submit' disabled={loading || !!error}>
              Salvar
            </Button>
          </DialogActions>
        </FormValidation>
      </Dialog>
    );
  }
}

function Transition(props: any) {
  return <Slide direction='up' {...props} />;
}

// @flow

import * as React from 'react';

type Props = {
  apiClient: Object, // opt-out of type checker until Flow types are exported for APIClient
  executionResult: {},
  onChange: (string, ?string) => mixed,
  openLaw: Object, // opt-out of type checker
  savedValue: string,
  textLikeInputClass: string,
  variable: {},
};

type State = {
  email: string,
  validationError: boolean,
};

export class Identity extends React.Component<Props, State> {
  openLaw = this.props.openLaw;

  state = {
    email: '',
    validationError: false,
  };

  constructor(props: Props) {
    super(props);

    const self: any = this;
    self.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    try {
      if (this.props.savedValue) {
        const identity = this.openLaw.checkValidity(
          this.props.variable,
          this.props.savedValue,
          this.props.executionResult,
        );

        this.setState({
          email: this.openLaw.getIdentityEmail(identity),
        });
      } else {
        this.setState({
          email: '',
        });
      }
    } catch (error) {
      this.setState({
        email: '',
      });
    }
  }

  onChange(event: SyntheticEvent<HTMLInputElement>) {
    const eventValue = event.currentTarget.value;

    try {
      if (!eventValue) {
        this.setState({
          email: '',
          validationError: false,
        }, () => {
          this.props.onChange(this.openLaw.getName(this.props.variable), '');
        });
      } else {
        this.setState({
          email: eventValue,
          validationError: false,
        });

        const variableName = this.openLaw.getName(this.props.variable);

        this.props.onChange(
          variableName,
          this.openLaw.createIdentityInternalValue('', eventValue),
        );

        this.props.apiClient.getUserDetails(eventValue).then(result => {
          if (result.email) {
            this.props.onChange(
              variableName,
              this.openLaw.createIdentityInternalValue(result.id, result.email),
            );

            this.setState({
              email: result.email,
              validationError: false,
            });
          }
        });
      }
    } catch (error) {
      this.setState({
        email: eventValue,
        validationError: true,
      });
    }
  }

  render() {
    const variable = this.props.variable;
    const cleanName = this.openLaw.getCleanName(variable);
    const description = this.openLaw.getDescription(variable);
    const additionalClassName = this.state.validationError ? ' is-error' : '';

    return (
      <div className="contract-variable identity">
        <label>
          <span>{description}</span>

          <input
            className={`${this.props.textLikeInputClass}${cleanName}-email${additionalClassName}`}
            onChange={this.onChange}
            placeholder={description}
            title={description}
            type="email"
            value={this.state.email}
          />
        </label>
      </div>
    );
  }
}

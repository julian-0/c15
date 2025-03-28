import React, { Component } from 'react';
import './NumericInput.css';

class NumericInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            valid: true, // Indica si el valor es válido.
            value: this.props.value, // Inicializa el valor con el mínimo permitido.
            error: this.props.error
        };
    }

    componentDidUpdate(prevProps) {
        // Verifica si la prop 'value' ha cambiado.
        if (!isNaN(this.props.value) && this.props.value !== prevProps.value) {
            if (this.props.value < this.props.min || this.props.value > this.props.max) {
                this.setState({ valid: false });
                //execute the onError function
                this.props.onError();
            } 
            this.setState({ value: this.props.value });
        }
        if (this.props.error !== prevProps.error) {
            this.setState({ error: this.props.error });
        }
    }

    validateOnlyNumbers(event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    }

    handleInputChange = (e) => {
        let value = e.target.value;
        value = parseInt(value, 10)
        if (value < this.props.min || value > this.props.max) {
            this.setState({ valid: false });
        }
        else if (!this.state.valid)
            this.setState({ valid: true });

        this.setState({ value }, () => {
            this.props.onChange(this.state.value); // Notifica al componente principal del cambio.
        });
    }

    buildTitle() {
        if(this.props.min === undefined && this.props.max === undefined){
            return 'Valor numérico';
        }
        if(this.props.min === undefined){
            return `Menor o igual a ${this.props.max}`;
        }
        if(this.props.max === undefined){
            return `Mayor o igual a ${this.props.min}`;
        }
        return `Entre ${this.props.min} y ${this.props.max}`;
    }

    render() {
        return (
            <input
                type="number"
                min={this.props.min}
                max={this.props.max}
                disabled={this.props.disabled}
                className={this.props.className + (!this.state.valid || this.state.error ? ' invalid' : '')}
                value={this.state.value} // Usa el valor del estado local.
                onChange={this.handleInputChange}
                title={this.buildTitle()}
            />
        );
    }
}

export default NumericInput;
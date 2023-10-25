import React, { Component } from 'react';
import './NumericInput.css';

class NumericInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            valid: true, // Indica si el valor es válido.
            value: this.props.value // Inicializa el valor con el mínimo permitido.
        };
    }

    componentDidUpdate(prevProps) {
        // Verifica si la prop 'value' ha cambiado.
        if (this.props.value !== prevProps.value) {
            this.setState({ value: this.props.value });
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
        else {
            this.setState({ valid: true });
        }
        this.setState({ value }, () => {
            this.props.onChange(this.state.value); // Notifica al componente principal del cambio.
        });
    }

    render() {
        return (
            <input
                type="number"
                min={this.props.min}
                max={this.props.max}
                className={this.props.className + (!this.state.valid ? ' invalid' : '')}
                value={this.state.value} // Usa el valor del estado local.
                onChange={this.handleInputChange}
                title={`Entre ${this.props.min} y ${this.props.max}`}
            />
        );
    }
}

export default NumericInput;
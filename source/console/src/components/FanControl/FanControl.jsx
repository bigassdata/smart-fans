import React from "react";

import {
    FormGroup,
    FormControl,
    ControlLabel,
    ListGroup,
    ListGroupItem
} from "react-bootstrap";

import Toggle from 'react-bootstrap-toggle';

/**
 * Component to Select a Fan
 * @param {props} props
 * @param {props.fans} an object with fans accessible by modbus address as the index
 * @param {props.selectedId} the modbus address of the selected fan
 */
function Select(props) {
    const { selectedId, fans, onSelect } = props;
    return (
        <FormGroup>
            <ControlLabel>Select a Fan to Issue Comamnds</ControlLabel>
            <FormControl componentClass="select" onChange={onSelect} value={selectedId}>
                <option value="" key="option-0">Select a fan</option>
                {
                    Object.keys(fans).map(fanIndex => <option value={fanIndex} key={`option-${fanIndex}`}> {`${fans[fanIndex].fanType} @ ${fanIndex}`} </option>)
                }
            </FormControl>
        </FormGroup>
    )
}

/**
 * A Control to show an on/off toggle button group
 * @param {object} props
 * @param {string} props.name - Name of the control
 * @param {boolean} props.value - True/False value of the control
 * @param {function} props.onChange - Function to handle changes to value
 */
function OnOffToggle(props) {
    return (
        <FormGroup>
            <ControlLabel>{props.label}</ControlLabel>
            <Toggle
                name={props.name}
                onClick={(state, node, evt) => props.onChange(evt.target.value)}
                on={<p>ON</p>}
                off={<p>OFF</p>}
                size="xs"
                offStyle="danger"
                active={props.value}
            />

        </FormGroup>
    );
}

/**
 * @param {object} props
 * @param {object} props.fans - A dictionary of fans by modbus address
 * @param {function} props.onUpdate - A function to communicate state changes
 *
 * @example
 *
 * const onUpdate = ({property, index, value}) => {
 *   console.log(`Fan ${index} set ${property} to ${value}`);
 * }
 *
 */
export class FanControl extends React.Component {
    constructor(props) {
        super(props);
        // Get the first index from fans;
        let fanIndexes = Object.keys(props.fans);
        let selectedId = fanIndexes[0];

        let selectedFan = props.fans[selectedId];
        this.state = { selectedId: selectedId, selectedFan: selectedFan }

        if (props.onUpdate) {
            this.onUpdate = props.onUpdate;
        } else {
            this.onUpdate = ({ property, index, value }) => {
                console.log(`Fan ${index} set ${property} to ${value}`);
            }
        }
        this.onUpdate = this.onUpdate.bind(this);

        this.onSelect = this.onSelect.bind(this);
        this.onPower = this.onPower.bind(this);
        this.onIsForward = this.onIsForward.bind(this);
        this.onAutoEnable = this.onAutoEnable.bind(this);
    }


    onSelect = (event) => {

        console.log(`Selected fan index is ${event.target.value}`);
        const selectedFan = this.props.fans[event.target.value];
        console.log(`Selected Fan is ${JSON.stringify(selectedFan)}`);
        this.setState({ selectedId: event.target.value, selectedFan: selectedFan });
    }

    // Toggle function - invert the current value and set it. We optimistically set the currentFan
    onPower = () => {
        let fan = this.state.selectedFan;
        fan.power = !fan.power;
        this.setState(
            { selectedFan: fan },
            () => {
                this.onUpdate({ index: this.state.selectedId, property: 'power', value: fan.power })
            }
        );
    }

    // Toggle function - invert the current value and set it. We optimistically set the currentFan
    onIsForward = () => {
        let fan = this.state.selectedFan;
        fan.isForward = !fan.isForward;
        this.setState(
            { selectedFan: fan },
            () => {
                this.onUpdate({ index: this.state.selectedId, property: 'isForward', value: fan.isForward });
            }
        )
    }

    // Toggle function - invert the current value and set it. We optimistically set the currentFan
    onAutoEnable = (val) => {
        let fan = this.state.selectedFan;
        fan.autoEnable = !fan.autoEnable;
        this.setState(
            { selectedFan: fan },
            () => {
                this.onUpdate({ index: this.state.selectedId, property: 'autoEnable', value: fan.autoEnable });
            }
        )
    }

    render() {
        const { fans } = this.props;
        if (!this.state.selectedFan) {
            return (
                <div>
                    <p>No fans to control.</p>
                </div>
            );
        }
        return (
            <div>
                <p>Fan Control</p>
                <ListGroup>
                    <ListGroupItem>
                        <Select fans={fans} onSelect={this.onSelect} selectedId={this.state.selectedId} />
                    </ListGroupItem>
                    <ListGroupItem>
                        <OnOffToggle label="Fan Power" name="powerOptions" value={this.state.selectedFan.power} onChange={this.onPower} />
                    </ListGroupItem>
                    <ListGroupItem>
                        <OnOffToggle label="Auto Enable" name="autoEnableOptions" value={this.state.selectedFan.autoEnable} onChange={this.onAutoEnable} />
                    </ListGroupItem>
                    <ListGroupItem>
                        <OnOffToggle label="Forward" name="forwardOptions" value={this.state.selectedFan.isForward} onChange={this.onIsForward} />
                    </ListGroupItem>
                </ListGroup>
            </div>
        )
    }
}




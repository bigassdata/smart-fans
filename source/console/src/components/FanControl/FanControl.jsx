import React from "react";

import {
    FormGroup,
    FormControl,
    ControlLabel,
    ListGroup,
    ListGroupItem,
    Grid,
    Row,
    Col,
    Button
} from "react-bootstrap";

import Switch from 'react-switch';

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
        <FormGroup controlId={props.name}>
            <ControlLabel style={{ textAlign: 'center' }}>{props.label}&nbsp;&nbsp;</ControlLabel>
            <Switch checked={props.value} onChange={props.onChange} />
        </FormGroup>
    );
}

/**
 *
 * @param {object} props
 * @param {object} props.fan - A fan object
 * @param {function} props.onChange - Function to handle number formcontrol's onChange event
 * @param {function} props.onClick - Function to handle submission of new speed.
 */
function SpeedControl(props) {
    return (
        <React.Fragment>
            <Col md={6}>
                <FormGroup>
                    <ControlLabel>Actual Speed (%)</ControlLabel>
                    <FormControl type="number" value={props.fan.actualSpeedPercent} disabled />
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <ControlLabel>Commanded Speed (%)</ControlLabel>
                    <FormControl type="number" step="0.1" value={props.fan.commandedSpeedPercent}
                        onChange={props.onChange} disabled={!props.fan.power} />
                </FormGroup>
            </Col>
            <Button bsStyle="warning" bsSize="small" className="btn-fill pull-right" disabled={!props.fan.power}
                onClick={props.onClick}>
                Set Speed
        </Button>
            <div className="clearfix" />
        </React.Fragment>
    );
}

/**
 *
 * @param {object} props
 * @param {object} props.fan - fan object
 * @param {function} props.onClick - function to trigger clearing faults
 */
function FaultControl(props) {
    return (
        <React.Fragment>
            <Col>
                <FormGroup>
                    <ControlLabel>Current Fault Status</ControlLabel>
                    <FormControl type="text" value={props.fan.activeFault} disabled />
                    <Button bsStyle="warning" bsSize="small" className="btn-fill pull-right" onClick={props.onClick}>Clear Faults</Button>
                </FormGroup>
            </Col>
            <div className="clearfix" />
        </React.Fragment>
    )
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
        this.setState({ selectedId: event.target.value, selectedFan: selectedFan }, () => this.forceUpdate());
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

    onCommandedSpeed = (val) => {
        let fan = this.state.selectedFan;
        fan.commandedSpeedPercent = +val;
        this.setState(
            { selectedFan: fan }
        )
    }

    handleSpeedCommand = () => {
        let fan = this.state.selectedFan;
        this.onUpdate({ index: this.state.selectedId, property: 'commandedSpeedPercent', value: fan.commandedSpeedPercent });
    }

    handleResetFaults = () => {
        let fan = this.state.selectedFan;
        fan.activeFault = '';
        this.setState(
            { selectedFan: fan },
            () => {
                this.onUpdate({ index: this.state.selectedId, property: 'resetFaults', value: true });
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
                        <Grid>
                            <Row>
                                <Col md={4}>
                                    <OnOffToggle label="Power" name="powerOptions" value={this.state.selectedFan.power} onChange={this.onPower} />
                                </Col>
                                <Col md={4}>
                                    <OnOffToggle label="Auto Enable" name="autoEnableOptions" value={this.state.selectedFan.autoEnable} onChange={this.onAutoEnable} />
                                </Col>
                                <Col md={4}>
                                    <OnOffToggle label="Forward" name="forwardOptions" value={this.state.selectedFan.isForward} onChange={this.onIsForward} />
                                </Col>
                            </Row>
                        </Grid>
                    </ListGroupItem>
                    <ListGroupItem>
                        <SpeedControl fan={this.state.selectedFan} onChange={(event) => { this.onCommandedSpeed(event.target.value) }} onClick={this.handleSpeedCommand} />
                    </ListGroupItem>
                    <ListGroupItem>
                        <FaultControl fan={this.state.selectedFan} onClick={() => { this.handleResetFaults() }} />
                    </ListGroupItem>
                </ListGroup>
            </div>
        )
    }
}

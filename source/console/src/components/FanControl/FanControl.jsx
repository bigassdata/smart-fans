import React from "react";

import {
    Grid,
    Col,
    Row,
    ToggleButtonGroup,
    ToggleButton,
    FormGroup,
    FormControl,
    ControlLabel
} from "react-bootstrap";

/**
 * Component to Select a Fan
 * @param {props} props
 * @param {props.fans} an object with fans accessible by modbus address as the index
 * @param {props.selectedId} the modbus address of the selected fan
 */
function Select(props) {

    // TODO: Fix Me!

    const { selectedId, fans, handleSelect } = props;
    return (
        <form>
            <Col md={12}>
                <FormGroup>
                    <ControlLabel>Select a Fan to Issue Comamnds</ControlLabel>
                    <FormControl componentClass="select" onChange={handleSelect} value={selectedId}>
                        <option value="">Select a fan</option>
                        {
                            Object.keys(fans).map(fanIndex => <option value={fanIndex}> {`${fans[fanIndex].fanType} @ ${fanIndex}`} </option>)
                        }
                    </FormControl>
                </FormGroup>
            </Col>
            <div className="clearfix" />
        </form>
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
        <ToggleButtonGroup type="radio" name={props.name} value={props.value} onChange={props.onChange}>
            <ToggleButton bsSize="small" value={true}>On</ToggleButton>
            <ToggleButton bsSize="small" value={false}>Off</ToggleButton>
        </ToggleButtonGroup>
    );
}


export class FanControl extends React.Component {
    state = { selectedId: 1, selectedFan: { power: null, fanType: '', isForward: null, autoEnable: null } }

    onSelect = (eventKey) => {
        console.log(eventKey);
        const selectedFan = this.props.fans[eventKey];
        this.setState({ selectedId: eventKey, selectedFan: selectedFan });
    }

    onPower = (val) => {
        console.log(`Set power for fan ${this.state.selectedId} to ${val}`)
        const selectedFan = this.props.fans[this.state.selectedId];
        selectedFan.power = !!val;
        this.setState({ selectedFan: selectedFan });

    }

    onIsForward = (val) => {
        console.log(`Set isForward for fan ${this.state.selectedId} to ${val}`);
        const selectedFan = this.props.fans[this.state.selectedId];
        selectedFan.isForward = !!val;
        this.setState({ selectedFan: selectedFan });

    }

    onAutoEnable = (val) => {
        console.log(`Set autoEnable for fan ${this.state.selectedId} to ${val}`)
        const selectedFan = this.props.fans[this.state.selectedId];
        selectedFan.autoEnable = !!val;
        this.setState({ selectedFan: selectedFan });

    }

    render() {
        const { fans } = this.props;

        console.log(`Selected fan is ${this.state.selectedId}`);
        console.log(`Fan state is ${JSON.stringify(this.state.selectedFan)}`);

        return (
            <Grid>
                <Row>
                    <Col>
                        Select a Fan &nbsp;<Select fans={fans} onSelect={this.onSelect} selectedId={this.state.selectedId} />
                    </Col>
                </Row>
                <Row>
                    <Col md={1}>
                        Fan Power &nbsp;<OnOffToggle name="powerOptions" value={this.state.selectedFan.power} onChange={this.onPower} />
                    </Col>
                </Row>
                <Row>
                    <Col md={1}>
                        Forward &nbsp;<OnOffToggle name="forwardOptions" value={this.state.selectedFan.isForward} onChange={this.onIsForward} />
                    </Col>
                </Row>
                <Row>
                    <Col md={1}>
                        Auto Mode &nbsp;<OnOffToggle name="autoEnableOptions" value={this.state.selectedFan.autoEnable} onChange={this.onAutoEnable} />
                    </Col>
                </Row>
            </Grid>
        )
    }
}




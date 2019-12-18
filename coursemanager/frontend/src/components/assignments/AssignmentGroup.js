import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";

import Loader from "../common/Loader";
import ConfirmModal from "../common/ConfirmModal";

import {
  getAssignmentGroup,
  deleteAssignmentGroup,
  createAssignment
} from "../../actions/assignments";

export class AssignmentGroup extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    instructorCourses: PropTypes.object.isRequired,
    taCourses: PropTypes.object.isRequired,
    studentCourses: PropTypes.object.isRequired,
    assignmentGroup: PropTypes.object,
    assignments: PropTypes.array.isRequired,
    getAssignmentGroup: PropTypes.func.isRequired,
    deleteAssignmentGroup: PropTypes.func.isRequired,
    createAssignment: PropTypes.func.isRequired
  };

  state = {
    deleted: null,
    showConfirmModal: false,
    title: "",
    points: "",
    dueDate: ""
  };

  componentDidMount() {
    const { group } = this.props.match.params;

    this.props.getAssignmentGroup(group);
  }

  onShow = e => {
    e.preventDefault();

    this.setState({ showConfirmModal: true });
  };

  onHide = e => {
    this.setState({ showConfirmModal: false });
  };

  onDelete = e => {
    e.preventDefault();

    const id = this.props.match.params.group;
    this.props
      .deleteAssignmentGroup(id)
      .then(res => this.setState({ deleted: res }));
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const { course, group } = this.props.match.params;
    const { title, points } = this.state;
    const due_date = this.state.dueDate;

    const assignment = { course, group, title, points, due_date };
    this.props.createAssignment(assignment).then(res => {
      if (res) {
        this.setState({
          title: "",
          points: "",
          dueDate: ""
        });
      }
    });
  };

  render() {
    const courseId = this.props.match.params.course;
    if (this.state.deleted) {
      return <Redirect to={`/courses/${courseId}/view`} />;
    }

    const groupId = this.props.match.params.group;
    const isInstructor = this.props.instructorCourses.has(courseId);
    const isTa = this.props.taCourses.has(courseId);
    const isStudent = this.props.studentCourses.has(courseId);

    const noPermissions = !isInstructor && !isTa && !isStudent;
    if (noPermissions) {
      return (
        <Container>
          <p className="text-center">
            This assignment group either does not exist or you do not have
            permission to access it. Please contact your professor if you
            believe this is a mistake.
          </p>
        </Container>
      );
    }

    if (this.props.assignmentGroup === null) {
      return <Loader />;
    }

    const course = isInstructor
      ? this.props.instructorCourses.get(courseId)
      : isTa
      ? this.props.taCourses.get(courseId)
      : isStudent
      ? this.props.studentCourses.get(courseId)
      : null;

    const addForm = (
      <Form onSubmit={this.onSubmit}>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Title</Form.Label>
            <Form.Control
              onChange={this.onChange}
              type="text"
              name="title"
              value={this.state.title}
              placeholder="Lab0"
            />
          </Form.Group>
          <Form.Group as={Col} className="col-auto">
            <Form.Label>Points</Form.Label>
            <Form.Control
              onChange={this.onChange}
              type="number"
              name="points"
              value={this.state.points}
              placeholder="10"
              min="0"
              max="32767"
            />
          </Form.Group>
          <Form.Group as={Col} className="col-auto">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              onChange={this.onChange}
              type="datetime-local"
              name="dueDate"
              value={this.state.dueDate}
            />
          </Form.Group>
          <Form.Group as={Col} className="col-auto ml-auto align-self-end">
            <Button type="submit">Add</Button>
          </Form.Group>
        </Form.Row>
      </Form>
    );

    return (
      <Container>
        <ConfirmModal
          show={this.state.showConfirmModal}
          msg="Are you sure you want to delete this assignment group and all of its corresponding assignments?"
          onHide={this.onHide}
          confirm={this.onDelete}
        />
        <Row className="align-items-center mb-3">
          <Col className="col-auto mr-auto">
            <h2>{`${course.course_id}: ${this.props.assignmentGroup.title}`}</h2>
          </Col>
          {isInstructor ? (
            <Col className="col-auto">
              <ButtonGroup aria-label="Edit or delete assignment group">
                <Button
                  variant="outline-primary"
                  href={`/#/courses/${courseId}/assignments/${groupId}/edit`}
                >
                  Edit
                </Button>
                <Button variant="outline-danger" onClick={this.onShow}>
                  Delete
                </Button>
              </ButtonGroup>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col>{isInstructor ? addForm : null}</Col>
        </Row>
        {this.props.assignments.length === 0 ? (
          <Row>
            <Col>
              <p className="text-center">Assignments will appear here.</p>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col className="col-auto mr-auto">Assignment</Col>
            <Col className="col-auto">Points</Col>
          </Row>
        )}
        {this.props.assignments.map(assignment => (
          <Row key={assignment.id}>
            <Col className="col-auto mr-auto">{assignment.title}</Col>
            <Col className="col-auto">{assignment.points}</Col>
          </Row>
        ))}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  instructorCourses: new Map(
    state.courses.instructorCourses.map(course => [`${course.id}`, course])
  ),
  taCourses: new Map(
    state.courses.taCourses.map(course => [`${course.id}`, course])
  ),
  studentCourses: new Map(
    state.courses.studentCourses.map(course => [`${course.id}`, course])
  ),
  assignmentGroup: state.assignments.assignmentGroup,
  assignments: state.assignments.assignments
});

const mapDispatchToProps = {
  getAssignmentGroup,
  deleteAssignmentGroup,
  createAssignment
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentGroup);

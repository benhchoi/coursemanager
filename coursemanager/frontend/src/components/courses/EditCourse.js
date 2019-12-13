import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { editCourse } from "../../actions/courses";

export class EditCourse extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    instructorCourses: PropTypes.object.isRequired,
    editCourse: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    const id = this.props.match.params.id;
    const isInstructor = this.props.instructorCourses.has(id);
    const course = isInstructor ? this.props.instructorCourses.get(id) : null;

    this.state = {
      edited: null,
      courseId: isInstructor ? course.course_id : "",
      title: isInstructor ? course.title : ""
    };
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const id = this.props.match.params.id;
    const course = {
      id,
      course_id: this.state.courseId,
      title: this.state.title
    };
    this.props.editCourse(course).then(res => this.setState({ edited: res }));
  };

  render() {
    const id = this.props.match.params.id;
    const isInstructor = this.props.instructorCourses.has(id);

    if (!isInstructor || this.state.edited) {
      return <Redirect to={`/courses/view/${id}`} />;
    }

    return (
      <Container>
        <h2>Edit Course</h2>
        <Form onSubmit={this.onSubmit}>
          <Form.Group>
            <Form.Label>Course ID</Form.Label>
            <Form.Control
              onChange={this.onChange}
              type="text"
              name="id"
              value={this.state.courseId}
              placeholder="CSE 131"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              onChange={this.onChange}
              type="text"
              name="title"
              value={this.state.title}
              placeholder="Computer Science I"
            />
          </Form.Group>
          <Form.Group>
            <Button type="submit">Publish</Button>
          </Form.Group>
        </Form>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  instructorCourses: new Map(
    state.courses.instructorCourses.map(course => [`${course.id}`, course])
  )
});

const mapDispatchToProps = { editCourse };

export default connect(mapStateToProps, mapDispatchToProps)(EditCourse);
import React from 'react';
import {shallow, mount} from 'enzyme';

import TodoItem from './todo-item';

describe('Todo Item', () => {
  const shallowTodoItem = props => shallow(<TodoItem {...props}/>);
  const mountTodoItem = props => mount(<TodoItem {...props}/>);

  it('should create component', () => {
    mountTodoItem().should.have.type(TodoItem);
  });

  it('should wrap children with div', () => {
    shallowTodoItem().should.have.tagName('div');
  });

  it('should use passed className', () => {
    shallowTodoItem({
      className: 'test-class'
    }).should.have.className('test-class');
  });

  // TODO Add more tests
});

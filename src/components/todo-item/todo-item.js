import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@jetbrains/ring-ui/components/checkbox/checkbox';

import './todo-item.css';

export default class TodoItem extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    updateCallback: PropTypes.func,
    itemId: PropTypes.string,
    checked: PropTypes.bool,
    label: PropTypes.string
  };

  /**
   * Remove task from localStorage
   */
  removeTask = e => {
    const id = e.target.parentNode.dataset.itemid;
    const item = JSON.parse(localStorage.getItem(id));
    localStorage.removeItem(id);
    // If task was from file, add it's ID to "removed" list
    if (item.fromFile) {
      const removedItems = localStorage.getItem('removed');
      if (!removedItems) {
        localStorage.setItem('removed', String(id));
      } else {
        localStorage.setItem('removed', `${removedItems}, ${id}`);
      }
    }
    this.props.updateCallback();
  };

  /**
   * Check/uncheck, update localStorage
   */
  toggleCheckbox = e => {
    const id = e.target.parentNode.parentNode.parentNode.dataset.itemid;
    const task = JSON.parse(localStorage.getItem(id));
    task.completed = !task.completed;
    localStorage.setItem(id, JSON.stringify(task));
    this.props.updateCallback();
  };

  render() {
    return (
      <div
        className="todo-item"
        key={this.props.itemId}
        data-itemid={this.props.itemId}
      >
        <div style={{width: '90%'}}>
          {this.props.checked
            ? <Checkbox defaultChecked onClick={this.toggleCheckbox}/>
            : <Checkbox onClick={this.toggleCheckbox}/>}
          <span className={this.props.checked
            ? 'item-text item-crossed'
            : 'item-text'}
          >{this.props.label}
          </span>
        </div>
        <i className="fa fa-times delete-task" aria-hidden="true" onClick={this.removeTask}/>
      </div>
    );
  }
}

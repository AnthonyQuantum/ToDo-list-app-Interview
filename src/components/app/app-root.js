import React, {Component} from 'react';
import {H1} from '@jetbrains/ring-ui/components/heading/heading';
import Input from '@jetbrains/ring-ui/components/input/input';
import Button from '@jetbrains/ring-ui/components/button/button';
import List from '@jetbrains/ring-ui/components/list/list';
import Group from '@jetbrains/ring-ui/components/group/group';
import Dropdown from '@jetbrains/ring-ui/components/dropdown/dropdown';
import PopupMenu from '@jetbrains/ring-ui/components/popup-menu/popup-menu';
import Alert from '@jetbrains/ring-ui/components/alert/alert';
import uuid from 'uuid';

import './app.css';
import TodoItem from '../todo-item/todo-item';

export default class AppRoot extends Component {
  constructor(props) {
    super(props);
    this.maxTasksCount = 100000;
    this.state = {
      tasks: [],
      show: 'all',
      sortMode: 'Unsorted',
      alert: ''
    };

    // Create the list of tasks, which were in the filebut been removed
    if (!localStorage.getItem('removed')) {
      localStorage.setItem('removed', '');
    }

    // Try to open JSON file with initial tasks data
    try {
      this.dataFile = require('../../../data/todo-list.json');
      if (!this.dataFile || !this.dataFile.tasks) {
        // No file found or found empty file
        throw Error;
      } else if (this.dataFile.tasks.length > this.maxTasksCount) {
        // Number of tasks in file exceeds maximum
        this.state.alert = 'Too many tasks in file (timit exceeded)';
      }
    } catch (ex) {
      this.state.alert = 'No correct file found';
    }
  }

  /**
   * Copy tasks from file to localStorage (except deleted ones)
   */
  componentDidMount() {
    // Check if file opened successfully
    if (!this.state.alert) {
      const removedTasks = localStorage.getItem('removed').split(', ');
      this.dataFile.tasks.forEach(task => {
        if (!localStorage.getItem(task.id) &&
            removedTasks.indexOf(task.id) === -1) {
          task.fromFile = true;
          localStorage.setItem(task.id, JSON.stringify(task));
        }
      });
    }
    this.locStorToState(null, null);
  }

  /**
   * Filter out completed tasks if needed (showMode)
   */
  applyShowFilter = (stateTemp, showMode) => {
    let newState = stateTemp;
    const showFilter = showMode || this.state.show;
    if (showFilter === 'uncompleted') {
      newState = newState.filter(task => !task.completed);
    }
    return newState;
  };

  /**
   * Sort tasks in specified order (sortMode)
   */
  applySortFilter = (stateTemp, sortMode) => {
    let newState = stateTemp;
    const sortFilter = sortMode || this.state.sortMode;
    switch (sortFilter) {
      case 'Uncompleted first':
        newState = [...newState.filter(task => !task.completed),
          ...newState.filter(task => task.completed)];
        break;
      case 'Completed first':
        newState = [...newState.filter(task => task.completed),
          ...newState.filter(task => !task.completed)];
        break;
      case 'Alphabetically':
        newState = newState.sort((task1, task2) => {
          const label1 = task1.label.toLowerCase();
          const label2 = task2.label.toLowerCase();
          if (label1 < label2) {
            return -1;
          }
          if (label1 > label2) {
            return 1;
          }
          return 0;
        });
        break;
      default:
        break;
    }
    return newState;
  };

  /**
   * Copy tasks from localStorage to component state
   */
  locStorToState = (showMode, sortMode) => {
    let newState = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const item = localStorage.getItem(key);
      if (key !== 'loglevel:webpack-dev-server' &&
          key !== 'removed') {
        newState.push(JSON.parse(item));
      }
    }

    newState = this.applyShowFilter(newState, showMode);
    newState = this.applySortFilter(newState, sortMode);
    this.setState({
      tasks: newState
    });
  }

  /**
   * Adds new task to localStorage
   */
  addTask = () => {
    const input = document.getElementById('task-input');
    if (input.value) {
      const newId = uuid.v4();
      localStorage.setItem(newId, JSON.stringify({
        id: newId,
        label: input.value,
        completed: false
      }));
    }
    input.value = '';
    this.locStorToState(null, null);
  };

  /**
   * Change which tasks are shown (all/uncompleted)
   */
  toggleShowMode = e => {
    let newShowMode;
    if (e.target.id === 'list-option-all') {
      newShowMode = 'all';
    } else if (e.target.id === 'list-option-uncompleted') {
      newShowMode = 'uncompleted';
    }
    this.setState({
      show: newShowMode
    });
    this.locStorToState(newShowMode, null);
  };

  /**
   * Change the way in which tasks are sorted
   */
  changeSortMode = e => {
    this.setState({
      sortMode: e.target.textContent
    });
    this.locStorToState(null, e.target.textContent);
  };

  /**
   * Close alert message
   */
  closeAlert = () => {
    this.setState({
      alert: ''
    });
  };

  render() {
    // List of tasks
    const tasksListData = this.state.tasks.map(task => ({
      rgItemType: List.ListProps.Type.CUSTOM,
      template: <TodoItem
        itemId={task.id}
        checked={task.completed}
        label={task.label}
        updateCallback={this.locStorToState}
      />
    }));

    // List of availiable sort modes (used in dropdown menu)
    const sortModes = ['Unsorted', 'Uncompleted first', 'Completed first', 'Alphabetically'].map(item => ({
      key: uuid.v4(),
      rgItemType: List.ListProps.Type.CUSTOM,
      template: <span
        key={uuid.v4()}
        onClick={this.changeSortMode}
      >
        {item}
      </span>
    }));

    return (
      <div>
        {this.state.alert && (
          <Alert
            type={Alert.Type.ERROR}
            onCloseRequest={this.closeAlert}
          >
            {this.state.alert}
          </Alert>
        )
        }

        <H1 className="main-header">{'ToDo List'}</H1>

        <Group className="input-group">
          <Input id="task-input" className="task-input" placeholder="What do you need to do?" borderless/>
          <Button className="add-button" onClick={this.addTask}>{'Add'}</Button>
        </Group>

        <div className="list-options">
          <div>
            <span id="list-option-all" className={`list-option ${this.state.show === 'all' ? 'list-option_active' : '' }`} onClick={this.toggleShowMode}>{'All'}</span>
            <span>&#124;</span>
            <span id="list-option-uncompleted" className={`list-option ${this.state.show === 'uncompleted' ? 'list-option_active' : '' }`} onClick={this.toggleShowMode}>{'Uncompleted'}</span>
          </div>

          <Dropdown className="sort-dropdown" anchor="Sort">
            <PopupMenu closeOnSelect data={sortModes}/>
          </Dropdown>
        </div>

        {tasksListData.length ? <List className="todo-list" data={tasksListData}/> : <div className="no-tasks">{'No more tasks to do :)'}</div>}
      </div>
    );
  }
}

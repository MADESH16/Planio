import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Board from './components/Board';
import TableView from './components/Views/TableView';
import ListView from './components/Views/ListView';
import TaskPage from './components/TaskPage';
import DragPreview from './components/DragPreview';
import GitHubModal from './components/GitHub/GitHubModal';
import AuthModal from './components/Auth/AuthModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import { useTasks } from './context/TaskContext';

function App() {
  const {
    currentView,
    selectedTaskForDetails,
    closeTaskDetails,
  } = useTasks();

  const [pageState, setPageState] = useState('board'); // 'board' | 'task-form'
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultColumnId, setDefaultColumnId] = useState('todo');

  const handleOpenCreatePage = (columnId = 'todo') => {
    setTaskToEdit(null);
    setDefaultColumnId(columnId);
    setPageState('task-form');
  };

  const handleOpenEditPage = (task) => {
    setTaskToEdit(task);
    setPageState('task-form');
  };

  const handleBackToBoard = () => {
    setPageState('board');
    setTaskToEdit(null);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'table':
        return <TableView onEditTask={handleOpenEditPage} />;
      case 'list':
        return <ListView onEditTask={handleOpenEditPage} />;
      case 'kanban':
      default:
        return (
          <Board
            onEditTask={handleOpenEditPage}
            onAddTask={handleOpenCreatePage}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar - Always visible */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header - Only visible on Board View */}
        {pageState === 'board' && (
          <Header onCreateTask={() => handleOpenCreatePage('todo')} />
        )}

        {/* Dynamic Page Body */}
        <main className="page-body">
          {pageState === 'board' ? (
            renderActiveView()
          ) : (
            <TaskPage
              taskToEdit={taskToEdit}
              defaultColumnId={defaultColumnId}
              onCancel={handleBackToBoard}
            />
          )}
        </main>
      </div>

      {/* GitHub Repository Management Modal */}
      <GitHubModal />

      {/* User Login & Registration Modal */}
      <AuthModal />

      {/* Full Task Details & Linked Commits Modal */}
      {selectedTaskForDetails && (
        <TaskDetailsModal
          task={selectedTaskForDetails}
          onClose={closeTaskDetails}
          onEditTask={handleOpenEditPage}
        />
      )}

      {/* Custom Drag Preview Overlay */}
      <DragPreview />
    </div>
  );
}

export default App;

chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // styles
        const styles = {
          nutritionLabel: `
            .woad-nutrition-label {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              width: 300px;
              z-index: 10000;
            }
            .woad-header {
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
              font-size: 18px;
              font-weight: bold;
            }
            .woad-task {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid #eee;
            }
            .woad-task-name {
              flex: 1;
            }
            .woad-task-hours {
              font-weight: 500;
            }
            .woad-total {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px solid #000;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
            }
            .woad-close {
              position: absolute;
              top: 10px;
              right: 10px;
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 4px;
              background: #f0f0f0;
            }
            .woad-section-divider {
              margin: 16px 0;
              border-top: 1px dashed #ccc;
            }
            .woad-section-header {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            .woad-no-hours {
              color: #666;
              font-style: italic;
            }
            span.woad-task-name, .woad-header, .woad-total, .woad-close, span.woad-task-hours {
                color: black;
            }
          `
        };

        // utility functions
        const createElement = (tag, className, textContent = '') => {
          const element = document.createElement(tag);
          if (className) element.className = className;
          if (textContent) element.textContent = textContent;
          return element;
        };

        const injectStyles = () => {
          const style = createElement('style');
          style.textContent = styles.nutritionLabel;
          document.head.appendChild(style);
        };

        const removeExistingLabels = () => {
          const existingLabels = document.querySelectorAll('.woad-nutrition-label');
          existingLabels.forEach(label => label.remove());
        };

        // task processing functions
        const parseTaskHours = (codeElement) => {
          if (!codeElement) return null;
          const match = codeElement.textContent.match(/^(\d+(\.\d+)?)h$/);
          return match ? parseFloat(match[1]) : null;
        };

        const extractTaskName = (taskElement, codeElement) => {
          return taskElement.textContent.replace(codeElement ? codeElement.textContent : '', '').trim();
        };

        const collectTasks = () => {
          const tasksWithHours = [];
          const tasksWithoutHours = [];

          document.querySelectorAll('.task_content').forEach(task => {
            const code = task.querySelector('code');
            const taskName = extractTaskName(task, code);
            const hours = parseTaskHours(code);

            if (hours !== null) {
              tasksWithHours.push({ name: taskName, hours });
            } else {
              tasksWithoutHours.push({ name: taskName });
            }
          });

          return { tasksWithHours, tasksWithoutHours };
        };

        // UI component functions
        const createTaskElement = (task, showHours = true) => {
          const taskElement = createElement('div', 'woad-task' + (showHours ? '' : ' woad-no-hours'));
          
          const nameElement = createElement('span', 'woad-task-name', task.name);
          taskElement.appendChild(nameElement);

          if (showHours) {
            const hoursElement = createElement('span', 'woad-task-hours', `${task.hours}h`);
            taskElement.appendChild(hoursElement);
          }

          return taskElement;
        };

        const createTasksSection = (tasks, showHours = true) => {
          const fragment = document.createDocumentFragment();
          
          tasks.forEach(task => {
            fragment.appendChild(createTaskElement(task, showHours));
          });

          return fragment;
        };

        const createTotalSection = (tasks) => {
          const total = tasks.reduce((sum, task) => sum + task.hours, 0);
          const totalElement = createElement('div', 'woad-total');
          totalElement.innerHTML = `
            <span>Total Hours</span>
            <span>${total}h</span>
          `;
          return totalElement;
        };

        const createNoHoursSection = (tasks) => {
          if (tasks.length === 0) return null;

          const fragment = document.createDocumentFragment();
          
          fragment.appendChild(createElement('div', 'woad-section-divider'));
          fragment.appendChild(createElement('div', 'woad-section-header', 'Tasks Without Hours'));
          fragment.appendChild(createTasksSection(tasks, false));

          return fragment;
        };

        // main initialization
        const init = () => {
          removeExistingLabels();
          injectStyles();

          const container = createElement('div', 'woad-nutrition-label');
          container.appendChild(createElement('div', 'woad-header', 'Task Hours Summary'));

          const closeButton = createElement('div', 'woad-close', '×');
          closeButton.onclick = () => container.remove();
          container.appendChild(closeButton);

          const { tasksWithHours, tasksWithoutHours } = collectTasks();
          tasksWithHours.sort((a, b) => b.hours - a.hours);

          container.appendChild(createTasksSection(tasksWithHours));
          container.appendChild(createTotalSection(tasksWithHours));

          const noHoursSection = createNoHoursSection(tasksWithoutHours);
          if (noHoursSection) {
            container.appendChild(noHoursSection);
          }

          document.body.appendChild(container);
        };

        // start the extension
        init();
      }
    });
  });  

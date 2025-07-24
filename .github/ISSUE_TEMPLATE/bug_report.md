---
name: "Bug Report"
description: "Сообщить об ошибке"
title: "[BUG] "
labels: [bug]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Спасибо за ваш вклад! Пожалуйста, опишите ошибку максимально подробно.
  - type: input
    id: summary
    attributes:
      label: "Краткое описание"
      description: "В чем заключается ошибка?"
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: "Шаги для воспроизведения"
      description: "Опишите шаги, чтобы воспроизвести ошибку."
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: "Ожидаемое поведение"
      description: "Что должно было произойти?"
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: "Фактическое поведение"
      description: "Что произошло на самом деле?"
    validations:
      required: true
  - type: input
    id: environment
    attributes:
      label: "Окружение"
      description: "ОС, браузер, версия Node.js и т.д."
    validations:
      required: false

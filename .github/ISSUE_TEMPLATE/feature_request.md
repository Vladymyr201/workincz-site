---
name: "Feature Request"
description: "Запрос на новую функцию"
title: "[FEATURE] "
labels: [enhancement]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Спасибо за предложение! Опишите вашу идею максимально подробно.
  - type: input
    id: summary
    attributes:
      label: "Краткое описание"
      description: "В чем суть предложения?"
    validations:
      required: true
  - type: textarea
    id: motivation
    attributes:
      label: "Мотивация"
      description: "Почему это важно? Какую проблему решает?"
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: "Предлагаемое решение"
      description: "Как вы видите реализацию?"
    validations:
      required: false

/**
 * This class provides utility functions for managing card templates on sys_sg_view_template.
 */
class CardTemplateUtility {
  constructor() {
    this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    this.suggestionsService = new SuggestionsService();
    this.suggestionsService.setDocumentMatchThreshold(0.3);
    this.starterTemplates = [
      {
        sys_id: '6bb0be5c41a71010f877183fc9b8be0c',
        name: 'Template 01',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description: '',
            type: 'label',
            groupedWith: ['text_05'],
          },
          {
            name: 'text_05',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_04'],
          },
          {
            name: 'text_06',
            description: '',
            type: 'label',
            groupedWith: ['text_07', 'image_01'],
          },
          {
            name: 'text_07',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_06', 'image_01'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'image_01',
            description: 'Used for small images',
            type: 'image',
            groupedWith: ['text_06', 'text_07'],
          },
        ],
      },
      {
        sys_id: 'ca3073d30f202010e70a4abec4767ecb',
        name: 'Template 02',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description: '',
            type: 'label',
            groupedWith: ['text_05'],
          },
          {
            name: 'text_05',
            description:
              'Used for small data. Grouped with another data and label by a separator',
            type: 'value',
            groupedWith: ['text_04'],
          },
          {
            name: 'text_06',
            description: '',
            type: 'label',
            groupedWith: ['text_07'],
          },
          {
            name: 'text_07',
            description:
              'Used for small data. Grouped with another data and label by a separator',
            type: 'value',
            groupedWith: ['text_06'],
          },
          {
            name: 'text_08',
            description: '',
            type: 'label',
            groupedWith: ['text_09', 'image_02'],
          },
          {
            name: 'text_09',
            description: 'Used for small data',
            type: 'value',
            groupedWith: ['text_08', 'image_02'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'text_separator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_04', 'text_05', 'text_06', 'text_07'],
          },
          {
            name: 'text_icon_02',
            description: 'this is unused in the template json',
            type: 'icon',
            groupedWith: [],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: 'image',
            groupedWith: ['text_03', 'text_05', 'text_07'],
          },
          {
            name: 'image_02',
            description: 'Used for small images',
            type: 'image',
            groupedWith: ['text_08', 'text_09'],
          },
        ],
      },
      {
        sys_id: 'd88fab930f202010e70a4abec4767eee',
        name: 'Template 03',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description: 'Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: 'value',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '60de27930f202010e70a4abec4767ebe',
        name: 'Template 04',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description: 'Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: 'value',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '822e2f530f202010e70a4abec4767eee',
        name: 'Template 05',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: 'value',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '7f9d2b530f202010e70a4abec4767e5e',
        name: 'Template 06',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description:
              'Used for medium data, has an icon and is highlighted text, secondary, does not have a label',
            type: 'value',
            groupedWith: ['icon_02'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'icon_02',
            description: '',
            type: 'icon',
            groupedWith: ['text_04'],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: 'image',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'a80da3530f202010e70a4abec4767e21',
        name: 'Template 07',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'icon_01',
            description: '',
            type: 'icon',
            groupedWith: [],
          },
          {
            name: 'arrow_icon_01',
            description: '',
            type: 'decorator',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '90607a5ed5ff4110f87745a87b9fad2e',
        name: 'Template 08',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'video_01',
            description: '',
            type: 'video',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '077970bed537c110f87745a87b9fad3f',
        name: 'Template 09',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'video_01',
            description: '',
            type: 'video',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '0f71c936d577c110f87745a87b9fadab',
        name: 'Template 10',
        templateSlotDescriptions: [
          {
            name: 'video_01',
            description: '',
            type: 'video',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '5c3345b6d577c110f87745a87b9fad9c',
        name: 'Template 11',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'video_01',
            description: '',
            type: 'video',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'a5d40df6d577c110f87745a87b9faded',
        name: 'Template 12',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'video_01',
            description: '',
            type: 'video',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'dda246f6c0730110f877fff44c61cf7c',
        name: 'Template 13',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'button_02',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'image_01',
            description: 'Used for large images',
            type: '',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '8227463ec0730110f877fff44c61cf8a',
        name: 'Template 14',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Used for small data, will be overlayed on top of Background_container_02, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01', 'Background_container_02'],
          },
          {
            name: 'text_02',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'Background_container_02',
            description: 'Used for large images, text_01 is overlayed on top',
            type: 'image',
            groupedWith: ['text_01', 'text_decorator_01'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'bfe7d7efc0bf8110f877fff44c61cf3e',
        name: 'Template 17',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'ad12dea419001110f87704a97fc65f2a',
        name: 'Template 18',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description: '',
            type: 'label',
            groupedWith: ['text_05'],
          },
          {
            name: 'text_05',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_04'],
          },
          {
            name: 'text_06',
            description: '',
            type: 'label',
            groupedWith: ['text_07', 'icon_01'],
          },
          {
            name: 'text_07',
            description: 'Used for small data, grouped icon is a map',
            type: 'value',
            groupedWith: ['text_06, icon_01'],
          },
          {
            name: 'text_08',
            description: '',
            type: 'label',
            groupedWith: ['text_09', 'icon_02'],
          },
          {
            name: 'text_09',
            description: 'Used for small data, grouped icon is a clock',
            type: 'value',
            groupedWith: ['text_08', 'icon_02'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'button_02',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'icon_01',
            description: '',
            type: 'icon',
            groupedWith: ['text_06', 'text_07'],
          },
          {
            name: 'icon_02',
            description: '',
            type: 'icon',
            groupedWith: ['text_08', 'text_09'],
          },
          {
            name: 'image_01',
            description: '',
            type: 'image',
            groupedWith: ['text_03', 'text_04', 'text_05'],
          },
        ],
      },
      {
        sys_id: 'eae03e5c41a71010f877183fc9b8be24',
        name: 'Template 19',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description: 'Used for medium data, grouped icon is a map',
            type: 'value',
            groupedWith: ['icon_01'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'icon_01',
            description: '',
            type: 'icon',
            groupedWith: ['text_04'],
          },
        ],
      },
      {
        sys_id: 'fb7edf67c0ff8110f877fff44c61cf78',
        name: 'Template 20',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_03',
            description: '',
            type: 'label',
            groupedWith: ['text_04'],
          },
          {
            name: 'text_04',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_03'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
        ],
      },
      {
        sys_id: '9c9dab27c033c110f877fff44c61cf39',
        name: 'Template 21',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_02'],
          },
          {
            name: 'text_03',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_05',
            description: '',
            type: 'label',
            groupedWith: ['text_06'],
          },
          {
            name: 'text_06',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_05'],
          },
          {
            name: 'text_07',
            description: '',
            type: 'label',
            groupedWith: ['text_08'],
          },
          {
            name: 'text_08',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_07'],
          },
          {
            name: 'text_09',
            description: '',
            type: 'label',
            groupedWith: ['text_10'],
          },
          {
            name: 'text_10',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_09'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'text_decorator_02',
            description: '',
            type: 'decorator',
            groupedWith: ['text_02'],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'button_02',
            description: '',
            type: 'button',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '4b5366df5526c110f877aee133c2a234',
        name: 'Template 22',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_01'],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_decorator_02'],
          },
          {
            name: 'text_03',
            description: 'Used for Large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_04',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_05',
            description: '',
            type: 'label',
            groupedWith: ['text_06'],
          },
          {
            name: 'text_06',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_05'],
          },
          {
            name: 'text_07',
            description: '',
            type: 'label',
            groupedWith: ['text_08'],
          },
          {
            name: 'text_08',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_07'],
          },
          {
            name: 'text_09',
            description: '',
            type: 'label',
            groupedWith: ['text_10'],
          },
          {
            name: 'text_10',
            description: 'Used for medium data',
            type: 'value',
            groupedWith: ['text_09'],
          },
          {
            name: 'text_decorator_01',
            description: '',
            type: 'decorator',
            groupedWith: ['text_01'],
          },
          {
            name: 'text_decorator_02',
            description: '',
            type: 'decorator',
            groupedWith: ['text_02'],
          },
          {
            name: 'button_01',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'button_02',
            description: '',
            type: 'button',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: '4d413a5c41a71010f877183fc9b8be8c',
        name: 'Grouped List',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'text_02',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['arrow_icon_01'],
          },
          {
            name: 'arrow_icon_01',
            description: '',
            type: 'icon',
            groupedWith: ['text_02'],
          },
        ],
      },
      {
        sys_id: '7eb49d52b723101096aa25efce11a954',
        name: 'Default Empty State Template',
        templateSlotDescriptions: [
          {
            name: 'es-text-slot-1',
            description:
              'Select the most important text field that clearly conveys meaning without relying on its field name. Used for large data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'es-text-slot-2',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: [],
          },
          {
            name: 'es-image-slot-1',
            description: 'Used for large images',
            type: 'image',
            groupedWith: [],
          },
          {
            name: 'es-button-slot-1',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'es-button-slot-2',
            description: '',
            type: 'button',
            groupedWith: [],
          },
          {
            name: 'es-button-slot-3',
            description: '',
            type: 'button',
            groupedWith: [],
          },
        ],
      },
      {
        sys_id: 'b4671d75b5a15110f8771a05af6ef581',
        name: 'Calendar',
        templateSlotDescriptions: [
          {
            name: 'text_01',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: ['text_02'],
          },
          {
            name: 'text_02',
            description: 'Used for medium data, does not have a label',
            type: 'value',
            groupedWith: ['text_01'],
          },
          {
            name: 'text_03',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_04', 'text_05'],
          },
          {
            name: 'text_04',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_03', 'text_05'],
          },
          {
            name: 'text_05',
            description: 'Used for small data, does not have a label',
            type: 'value',
            groupedWith: ['text_03', 'text_04'],
          },
        ],
      },
    ];
    this.starterTemplateFilter =
      'sys_idIN' +
      this.starterTemplates.map((template) => template.sys_id).join(',');
    this.starterTemplateSearchProfile =
      'sn_mab_api_mab_sys_sg_view_template_starter_templates';
  }

  /**
   * Get recommended starter templates
   * This function returns a list of recommended starter templates for card creation based on an input query.
   *
   * @returns {Array} An array of recommended starter templates.
   */
  getRecommendedStarterTemplates(query) {
    if (typeof query !== 'string') {
      this.customErrorHandler.throwBadRequestError(
        'INVALID_INPUT',
        `Failed AIS Template Lookup. query must be a string. Received: ${query}`
      );
    }

    return this.suggestionsService.getSuggestions(
      'sys_sg_view_template',
      query,
      ['sys_id', 'name'],
      this.starterTemplateFilter,
      this.starterTemplateSearchProfile
    );
  }

  /**
   * Get starter template metadata by name
   * This function returns the metadata of a starter template based on the name.
   *
   * @param {string} name - The name of the starter template to get metadata for.
   * @returns {object} - An object of the starter template metadata.
   */
  getStarterTemplateMetadataByName(name) {
    if (typeof name !== 'string') {
      this.customErrorHandler.throwBadRequestError(
        'INVALID_INPUT',
        `Failed AIS Template Lookup. name must be a string. Received: ${name}`
      );
    }

    return this.starterTemplates.find((template) => template.name === name);
  }

  /**
   * Validates the mapped json object is parsable and conforms to the needed structure.
   *
   * @param {string} templateId - sys id of the template that the fields from the mapped json come from.
   *
   * @returns {object} - An object of the template that the mapped json comes from.
   */
  getCardTemplate(templateId) {
    const gr = new GlideRecord('sys_sg_view_template');
    gr.get(templateId);
    if (!gr.isValid()) {
      this.customErrorHandler.throwBadRequestError(
        'CARD_TEMPLATE_NOT_FOUND',
        `Failed mapping. Card template does not exist: ${templateId}`
      );
    }

    const slots = [];
    const slotGr = new GlideRecord('sys_sg_view_template_slot');
    slotGr.addQuery('view_template', templateId);
    slotGr.query();
    while (slotGr.next()) {
      slots.push({
        id: slotGr.sys_id.toString(),
        name: slotGr.name.toString(),
        type: 'ANCHOR',
      });
    }

    return {
      id: gr.sys_id.toString(),
      name: gr.name.toString(),
      slots: slots,
    };
  }

  /**
   * Get starter template metadata by name
   * This function returns the metadata of a starter template based on the name.
   *
   * @param {string} name - The name of the starter template to get metadata for.
   * @returns {object} - An object of the starter template metadata.
   */
  getStarterTemplateMetadataByName(name) {
    if (typeof name !== 'string') {
      this.customErrorHandler.throwBadRequestError(
        'INVALID_INPUT',
        `Failed AIS Template Lookup. name must be a string. Received: ${name}`
      );
    }

    return this.starterTemplates.find((template) => template.name === name);
  }

  /**
   * Validates the mapped json object is parsable and conforms to the needed structure.
   *
   * @param {string} templateId - sys id of the template that the fields from the mapped json come from.
   *
   * @returns {object} - An object of the template that the mapped json comes from.
   */
  getCardTemplate(templateId) {
    const gr = new GlideRecord('sys_sg_view_template');
    gr.get(templateId);
    if (!gr.isValid()) {
      this.customErrorHandler.throwBadRequestError(
        'CARD_TEMPLATE_NOT_FOUND',
        `Failed mapping. Card template does not exist: ${templateId}`
      );
    }

    const slots = [];
    const slotGr = new GlideRecord('sys_sg_view_template_slot');
    slotGr.addQuery('view_template', templateId);
    slotGr.query();
    while (slotGr.next()) {
      slots.push({
        id: slotGr.sys_id.toString(),
        name: slotGr.name.toString(),
        type: 'ANCHOR',
      });
    }

    return {
      id: gr.sys_id.toString(),
      name: gr.name.toString(),
      slots: slots,
    };
  }
}

module.exports = CardTemplateUtility;

// Generated: inlined manifests so the mockup also works from file://
window.PPP_PACKS = {
 "baby-mole": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "baby-mole",
  "name": "Baby Mole",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 15,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 15,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "olmlet": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "olmlet",
  "name": "Olmlet",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 40,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 38
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 12,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 40,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "baby-chinchompa": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "baby-chinchompa",
  "name": "Baby Chinchompa",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "variants/grey/sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "right",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "variants/grey/frames/idle_00.png",
     "variants/grey/frames/idle_01.png",
     "variants/grey/frames/idle_02.png",
     "variants/grey/frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/grey/frames/walk_00.png",
     "variants/grey/frames/walk_01.png",
     "variants/grey/frames/walk_02.png",
     "variants/grey/frames/walk_03.png",
     "variants/grey/frames/walk_04.png",
     "variants/grey/frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "variants/grey/frames/sleep_00.png",
     "variants/grey/frames/sleep_01.png",
     "variants/grey/frames/sleep_02.png",
     "variants/grey/frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/grey/frames/happy_00.png",
     "variants/grey/frames/happy_01.png",
     "variants/grey/frames/happy_02.png",
     "variants/grey/frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "variants/grey/frames/celebrate_00.png",
     "variants/grey/frames/celebrate_01.png",
     "variants/grey/frames/celebrate_02.png",
     "variants/grey/frames/celebrate_03.png",
     "variants/grey/frames/celebrate_04.png",
     "variants/grey/frames/celebrate_05.png",
     "variants/grey/frames/celebrate_06.png",
     "variants/grey/frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "defaultVariant": "grey",
  "variants": [
   {
    "id": "grey",
    "name": "Grey",
    "sheet": "variants/grey/sheet.png",
    "paletteColors": 16,
    "activities": {
     "sheet": "variants/grey/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "right",
     "paletteColors": 15,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/grey/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/grey/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/grey/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/grey/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/grey/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   },
   {
    "id": "red",
    "name": "Red",
    "sheet": "variants/red/sheet.png",
    "paletteColors": 16,
    "activities": {
     "sheet": "variants/red/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "right",
     "paletteColors": 15,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/red/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/red/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/red/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/red/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/red/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   },
   {
    "id": "black",
    "name": "Black",
    "sheet": "variants/black/sheet.png",
    "paletteColors": 16,
    "activities": {
     "sheet": "variants/black/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "right",
     "paletteColors": 15,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/black/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/black/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/black/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/black/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/black/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   },
   {
    "id": "gold",
    "name": "Gold",
    "sheet": "variants/gold/sheet.png",
    "paletteColors": 16,
    "activities": {
     "sheet": "variants/gold/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "right",
     "paletteColors": 15,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/gold/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/gold/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/gold/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/gold/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/gold/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   }
  ],
  "activities": {
   "sheet": "variants/grey/activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 15,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "variants/grey/activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/grey/activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "variants/grey/activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/grey/activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "variants/grey/activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "heron": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "heron",
  "name": "Heron",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 15,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 15,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "rocky": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "rocky",
  "name": "Rocky",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 15,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 15,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "phoenix": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "phoenix",
  "name": "Phoenix",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 14,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "lil-zik": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "lil-zik",
  "name": "Lil' Zik",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "variants/zik/sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "front",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "variants/zik/frames/idle_00.png",
     "variants/zik/frames/idle_01.png",
     "variants/zik/frames/idle_02.png",
     "variants/zik/frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/zik/frames/walk_00.png",
     "variants/zik/frames/walk_01.png",
     "variants/zik/frames/walk_02.png",
     "variants/zik/frames/walk_03.png",
     "variants/zik/frames/walk_04.png",
     "variants/zik/frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "variants/zik/frames/sleep_00.png",
     "variants/zik/frames/sleep_01.png",
     "variants/zik/frames/sleep_02.png",
     "variants/zik/frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/zik/frames/happy_00.png",
     "variants/zik/frames/happy_01.png",
     "variants/zik/frames/happy_02.png",
     "variants/zik/frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "variants/zik/frames/celebrate_00.png",
     "variants/zik/frames/celebrate_01.png",
     "variants/zik/frames/celebrate_02.png",
     "variants/zik/frames/celebrate_03.png",
     "variants/zik/frames/celebrate_04.png",
     "variants/zik/frames/celebrate_05.png",
     "variants/zik/frames/celebrate_06.png",
     "variants/zik/frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "defaultVariant": "zik",
  "variants": [
   {
    "id": "zik",
    "name": "Lil' Zik",
    "sheet": "variants/zik/sheet.png",
    "paletteColors": 16,
    "facing": "front",
    "activities": {
     "sheet": "variants/zik/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "right",
     "paletteColors": 16,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/zik/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/zik/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/zik/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/zik/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/zik/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   },
   {
    "id": "sot",
    "name": "Lil' Sot (Sotetseg form)",
    "sheet": "variants/sot/sheet.png",
    "paletteColors": 16,
    "facing": "left",
    "animations": {
     "idle": {
      "row": 0,
      "frames": 4,
      "fps": 4,
      "loop": true,
      "frameFiles": [
       "variants/sot/frames/idle_00.png",
       "variants/sot/frames/idle_01.png",
       "variants/sot/frames/idle_02.png",
       "variants/sot/frames/idle_03.png"
      ]
     },
     "walk": {
      "row": 1,
      "frames": 6,
      "fps": 8,
      "loop": true,
      "frameFiles": [
       "variants/sot/frames/walk_00.png",
       "variants/sot/frames/walk_01.png",
       "variants/sot/frames/walk_02.png",
       "variants/sot/frames/walk_03.png",
       "variants/sot/frames/walk_04.png",
       "variants/sot/frames/walk_05.png"
      ]
     },
     "sleep": {
      "row": 2,
      "frames": 4,
      "fps": 3,
      "loop": true,
      "frameFiles": [
       "variants/sot/frames/sleep_00.png",
       "variants/sot/frames/sleep_01.png",
       "variants/sot/frames/sleep_02.png",
       "variants/sot/frames/sleep_03.png"
      ]
     },
     "happy": {
      "row": 3,
      "frames": 4,
      "fps": 8,
      "loop": true,
      "frameFiles": [
       "variants/sot/frames/happy_00.png",
       "variants/sot/frames/happy_01.png",
       "variants/sot/frames/happy_02.png",
       "variants/sot/frames/happy_03.png"
      ]
     },
     "celebrate": {
      "row": 4,
      "frames": 8,
      "fps": 10,
      "loop": true,
      "frameFiles": [
       "variants/sot/frames/celebrate_00.png",
       "variants/sot/frames/celebrate_01.png",
       "variants/sot/frames/celebrate_02.png",
       "variants/sot/frames/celebrate_03.png",
       "variants/sot/frames/celebrate_04.png",
       "variants/sot/frames/celebrate_05.png",
       "variants/sot/frames/celebrate_06.png",
       "variants/sot/frames/celebrate_07.png"
      ]
     }
    },
    "activities": {
     "sheet": "variants/sot/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "left",
     "paletteColors": 16,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/sot/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/sot/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/sot/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/sot/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/sot/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   }
  ],
  "activities": {
   "sheet": "variants/zik/activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "variants/zik/activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/zik/activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "variants/zik/activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/zik/activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "variants/zik/activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "beef": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "beef",
  "name": "Beef",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "youngllef": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "youngllef",
  "name": "Youngllef",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "variants/corrupted/sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 13,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "variants/crystal/frames/idle_00.png",
     "variants/crystal/frames/idle_01.png",
     "variants/crystal/frames/idle_02.png",
     "variants/crystal/frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/crystal/frames/walk_00.png",
     "variants/crystal/frames/walk_01.png",
     "variants/crystal/frames/walk_02.png",
     "variants/crystal/frames/walk_03.png",
     "variants/crystal/frames/walk_04.png",
     "variants/crystal/frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "variants/crystal/frames/sleep_00.png",
     "variants/crystal/frames/sleep_01.png",
     "variants/crystal/frames/sleep_02.png",
     "variants/crystal/frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "variants/crystal/frames/happy_00.png",
     "variants/crystal/frames/happy_01.png",
     "variants/crystal/frames/happy_02.png",
     "variants/crystal/frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "variants/crystal/frames/celebrate_00.png",
     "variants/crystal/frames/celebrate_01.png",
     "variants/crystal/frames/celebrate_02.png",
     "variants/crystal/frames/celebrate_03.png",
     "variants/crystal/frames/celebrate_04.png",
     "variants/crystal/frames/celebrate_05.png",
     "variants/crystal/frames/celebrate_06.png",
     "variants/crystal/frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "defaultVariant": "corrupted",
  "variants": [
   {
    "id": "corrupted",
    "name": "Corrupted",
    "sheet": "variants/corrupted/sheet.png",
    "paletteColors": 13,
    "activities": {
     "sheet": "variants/corrupted/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "rune",
     "propSide": "left",
     "paletteColors": 16,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/corrupted/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/corrupted/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/corrupted/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/corrupted/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/corrupted/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   },
   {
    "id": "crystal",
    "name": "Crystal",
    "sheet": "variants/crystal/sheet.png",
    "paletteColors": 13,
    "activities": {
     "sheet": "variants/crystal/activities/activities.png",
     "frameWidth": 32,
     "frameHeight": 32,
     "layout": "row-per-activity",
     "gearTier": "dragon",
     "propSide": "left",
     "paletteColors": 15,
     "map": {
      "woodcutting": {
       "row": 0,
       "frames": 6,
       "fps": 8,
       "loop": true,
       "gif": "variants/crystal/activities/gifs/woodcutting.gif"
      },
      "mining": {
       "row": 1,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/crystal/activities/gifs/mining.gif"
      },
      "fishing": {
       "row": 2,
       "frames": 6,
       "fps": 6,
       "loop": true,
       "gif": "variants/crystal/activities/gifs/fishing.gif"
      },
      "combat": {
       "row": 3,
       "frames": 5,
       "fps": 8,
       "loop": true,
       "gif": "variants/crystal/activities/gifs/combat.gif"
      },
      "banking": {
       "row": 4,
       "frames": 6,
       "fps": 7,
       "loop": true,
       "gif": "variants/crystal/activities/gifs/banking.gif"
      }
     },
     "fallback": "activityMap"
    }
   }
  ],
  "activities": {
   "sheet": "variants/corrupted/activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "variants/corrupted/activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/corrupted/activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "variants/corrupted/activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "variants/corrupted/activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "variants/corrupted/activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "abyssal-orphan": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "abyssal-orphan",
  "name": "Abyssal orphan",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "front",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 13,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "butch": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "butch",
  "name": "Butch",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 40,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 38
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "front",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 40,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 15,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "lilviathan": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "lilviathan",
  "name": "Lil'viathan",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 14,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "baron": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "baron",
  "name": "Baron",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "callisto-cub": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "callisto-cub",
  "name": "Callisto cub",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 15,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "chaos-elemental": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "chaos-elemental",
  "name": "Pet chaos elemental",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "front",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 13,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "penance-queen": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "penance-queen",
  "name": "Pet penance queen",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "left",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 16,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "left",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 },
 "soup": {
  "schema": "pixel-pet-pals/pack@1",
  "id": "soup",
  "name": "Soup",
  "pack": "A-osrs-style",
  "version": "0.5.0",
  "license": "LICENSE.md",
  "sheet": {
   "file": "sheet.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "columns": 8,
   "rows": 5,
   "layout": "row-per-animation"
  },
  "anchor": {
   "x": 16,
   "y": 30
  },
  "offset": {
   "x": 0,
   "y": 0
  },
  "facing": "front",
  "scale": {
   "recommended": 4,
   "filter": "nearest"
  },
  "paletteColors": 13,
  "animations": {
   "idle": {
    "row": 0,
    "frames": 4,
    "fps": 4,
    "loop": true,
    "frameFiles": [
     "frames/idle_00.png",
     "frames/idle_01.png",
     "frames/idle_02.png",
     "frames/idle_03.png"
    ]
   },
   "walk": {
    "row": 1,
    "frames": 6,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/walk_00.png",
     "frames/walk_01.png",
     "frames/walk_02.png",
     "frames/walk_03.png",
     "frames/walk_04.png",
     "frames/walk_05.png"
    ]
   },
   "sleep": {
    "row": 2,
    "frames": 4,
    "fps": 3,
    "loop": true,
    "frameFiles": [
     "frames/sleep_00.png",
     "frames/sleep_01.png",
     "frames/sleep_02.png",
     "frames/sleep_03.png"
    ]
   },
   "happy": {
    "row": 3,
    "frames": 4,
    "fps": 8,
    "loop": true,
    "frameFiles": [
     "frames/happy_00.png",
     "frames/happy_01.png",
     "frames/happy_02.png",
     "frames/happy_03.png"
    ]
   },
   "celebrate": {
    "row": 4,
    "frames": 8,
    "fps": 10,
    "loop": true,
    "frameFiles": [
     "frames/celebrate_00.png",
     "frames/celebrate_01.png",
     "frames/celebrate_02.png",
     "frames/celebrate_03.png",
     "frames/celebrate_04.png",
     "frames/celebrate_05.png",
     "frames/celebrate_06.png",
     "frames/celebrate_07.png"
    ]
   }
  },
  "activityMap": {
   "skilling": "happy",
   "combat": "walk",
   "bossing": "walk",
   "banking": "idle",
   "traveling": "walk",
   "minigame": "happy",
   "idle": "sleep"
  },
  "eventMap": {
   "level_up": "celebrate",
   "pet_drop": "celebrate",
   "loot": "happy",
   "quest": "celebrate",
   "death": "sleep",
   "login": "happy",
   "logout": "sleep",
   "idle": "sleep"
  },
  "default": "idle",
  "activities": {
   "sheet": "activities/activities.png",
   "frameWidth": 32,
   "frameHeight": 32,
   "layout": "row-per-activity",
   "gearTier": "rune",
   "propSide": "right",
   "paletteColors": 16,
   "map": {
    "woodcutting": {
     "row": 0,
     "frames": 6,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/woodcutting.gif"
    },
    "mining": {
     "row": 1,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/mining.gif"
    },
    "fishing": {
     "row": 2,
     "frames": 6,
     "fps": 6,
     "loop": true,
     "gif": "activities/gifs/fishing.gif"
    },
    "combat": {
     "row": 3,
     "frames": 5,
     "fps": 8,
     "loop": true,
     "gif": "activities/gifs/combat.gif"
    },
    "banking": {
     "row": 4,
     "frames": 6,
     "fps": 7,
     "loop": true,
     "gif": "activities/gifs/banking.gif"
    }
   },
   "fallback": "activityMap"
  }
 }
};

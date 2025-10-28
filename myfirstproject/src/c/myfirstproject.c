#include <pebble.h>

static Window *s_window;
static TextLayer *s_time_layer;
static TextLayer *s_ampm_layer;
static TextLayer *s_ampm_layer2;
static Layer *s_border_layer;
static Layer *s_separator_layer1;
static Layer *s_separator_layer2;
static TextLayer *s_date_info_layer;
static TextLayer *s_scripture_layer;
static TextLayer *s_reference_bold_layer;
static TextLayer *s_reference_part_layer;

static void prv_border_draw(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  
  // Draw outer border (top and bottom only)
  graphics_context_set_stroke_color(ctx, GColorBlack);
  graphics_context_set_stroke_width(ctx, 2);
  graphics_draw_line(ctx, GPoint(2, 2), GPoint(bounds.size.w - 3, 2)); // Top
  graphics_draw_line(ctx, GPoint(2, bounds.size.h - 3), GPoint(bounds.size.w - 3, bounds.size.h - 3)); // Bottom
  
  // Draw inner border for book-like effect (top and bottom only)
  graphics_context_set_stroke_width(ctx, 1);
  graphics_draw_line(ctx, GPoint(6, 6), GPoint(bounds.size.w - 7, 6)); // Top
  graphics_draw_line(ctx, GPoint(6, bounds.size.h - 7), GPoint(bounds.size.w - 7, bounds.size.h - 7)); // Bottom
  
  // Add corner decorations (simple lines)
  graphics_draw_line(ctx, GPoint(2, 10), GPoint(10, 2));
  graphics_draw_line(ctx, GPoint(bounds.size.w - 3, 10), GPoint(bounds.size.w - 11, 2));
  graphics_draw_line(ctx, GPoint(2, bounds.size.h - 11), GPoint(10, bounds.size.h - 3));
  graphics_draw_line(ctx, GPoint(bounds.size.w - 3, bounds.size.h - 11), GPoint(bounds.size.w - 11, bounds.size.h - 3));
}

static void prv_separator_draw(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  
  // Draw double-line separator (full width)
  graphics_context_set_stroke_color(ctx, GColorBlack);
  graphics_context_set_stroke_width(ctx, 1);
  graphics_draw_line(ctx, GPoint(0, 0), GPoint(bounds.size.w, 0)); // Top line
  graphics_draw_line(ctx, GPoint(0, 3), GPoint(bounds.size.w, 3)); // Bottom line
}

static void prv_update_time() {
  // Get a tm structure
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);

  // Write the current hours and minutes into a buffer
  static char s_buffer[8];
  strftime(s_buffer, sizeof(s_buffer), clock_is_24h_style() ?
                                          "%H:%M" : "%I:%M", tick_time);

  // Display this time on the TextLayer
  text_layer_set_text(s_time_layer, s_buffer);

  // Write AM/PM if in 12h mode
  if (!clock_is_24h_style()) {
    static char ampm_buffer[3];
    strftime(ampm_buffer, sizeof(ampm_buffer), "%p", tick_time);
    if (strcmp(ampm_buffer, "AM") == 0) {
      text_layer_set_text(s_ampm_layer, "A");
      text_layer_set_text(s_ampm_layer2, "M");
    } else {
      text_layer_set_text(s_ampm_layer, "P");
      text_layer_set_text(s_ampm_layer2, "M");
    }
  } else {
    text_layer_set_text(s_ampm_layer, "");
    text_layer_set_text(s_ampm_layer2, "");
  }
}

static void prv_update_date() {
  // Get current date
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  
  // Create combined date info string: "Tuesday the 28th at N/A"
  static char date_info_buffer[40];
  static char day_buffer[12];
  
  // Get day of week
  strftime(day_buffer, sizeof(day_buffer), "%A", tick_time);
  
  // Get day with ordinal suffix
  int day = tick_time->tm_mday;
  const char *suffix = "th";
  
  // Determine ordinal suffix
  if (day == 1 || day == 21 || day == 31) suffix = "st";
  else if (day == 2 || day == 22) suffix = "nd";
  else if (day == 3 || day == 23) suffix = "rd";
  
  // Combine everything into one line
  snprintf(date_info_buffer, sizeof(date_info_buffer), "%s the %d%s at N/A", day_buffer, day, suffix);
  text_layer_set_text(s_date_info_layer, date_info_buffer);
}

static void prv_tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  prv_update_time();
  
  // Update date once per day (or on startup)
  if (units_changed & DAY_UNIT) {
    prv_update_date();
  }
}

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  #ifdef PBL_COLOR
    window_set_background_color(window, GColorYellow);
  #endif

  // Create border layer
  s_border_layer = layer_create(bounds);
  layer_set_update_proc(s_border_layer, prv_border_draw);
  layer_add_child(window_layer, s_border_layer);

  // Create the TextLayer with specific bounds
  s_time_layer = text_layer_create(
      GRect(5, 0, bounds.size.w - 25, 50));

  // Improve the layout to be more like a watchface
  text_layer_set_background_color(s_time_layer, GColorClear);
  text_layer_set_text_color(s_time_layer, GColorBlack);
  text_layer_set_text(s_time_layer, "00:00");
  text_layer_set_font(s_time_layer, fonts_get_system_font(FONT_KEY_LECO_42_NUMBERS));
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentLeft);

  // Add it as a child layer to the Window's root layer
  layer_add_child(window_layer, text_layer_get_layer(s_time_layer));

  // Create the TextLayer for AM/PM (first letter)
  s_ampm_layer = text_layer_create(GRect(bounds.size.w - 20, 8, 15, 25));
  text_layer_set_background_color(s_ampm_layer, GColorClear);
  text_layer_set_text_color(s_ampm_layer, GColorBlack);
  text_layer_set_text(s_ampm_layer, "");
  text_layer_set_font(s_ampm_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_ampm_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_ampm_layer));

  // Create the TextLayer for AM/PM (second letter)
  s_ampm_layer2 = text_layer_create(GRect(bounds.size.w - 20, 28, 15, 25));
  text_layer_set_background_color(s_ampm_layer2, GColorClear);
  text_layer_set_text_color(s_ampm_layer2, GColorBlack);
  text_layer_set_text(s_ampm_layer2, "");
  text_layer_set_font(s_ampm_layer2, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_ampm_layer2, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_ampm_layer2));

  // Create separator 1 (after time)
  s_separator_layer1 = layer_create(GRect(0, 52, bounds.size.w, 4));
  layer_set_update_proc(s_separator_layer1, prv_separator_draw);
  layer_add_child(window_layer, s_separator_layer1);

  // Create combined date info layer (day, date, temp on one line)
  s_date_info_layer = text_layer_create(GRect(0, 58, bounds.size.w, 20));
  text_layer_set_background_color(s_date_info_layer, GColorClear);
  text_layer_set_text_color(s_date_info_layer, GColorBlack);
  text_layer_set_font(s_date_info_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(s_date_info_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_date_info_layer));

  // Create separator 2 (before scripture)
  s_separator_layer2 = layer_create(GRect(0, 80, bounds.size.w, 4));
  layer_set_update_proc(s_separator_layer2, prv_separator_draw);
  layer_add_child(window_layer, s_separator_layer2);

  // Create scripture text layer (multi-line)
  s_scripture_layer = text_layer_create(GRect(4, 86, bounds.size.w - 8, 58));
  text_layer_set_background_color(s_scripture_layer, GColorClear);
  text_layer_set_text_color(s_scripture_layer, GColorBlack);
  text_layer_set_text(s_scripture_layer, "Whoever is patient has great understanding, but one who is quick-tempered displays folly.");
  text_layer_set_font(s_scripture_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(s_scripture_layer, GTextAlignmentCenter);
  text_layer_set_overflow_mode(s_scripture_layer, GTextOverflowModeTrailingEllipsis);
  layer_add_child(window_layer, text_layer_get_layer(s_scripture_layer));

  // Create reference layer - bold part (e.g., "Proverbs 14:29 - ")
  s_reference_bold_layer = text_layer_create(GRect(10, 147, 100, 18));
  text_layer_set_background_color(s_reference_bold_layer, GColorClear);
  text_layer_set_text_color(s_reference_bold_layer, GColorBlack);
  text_layer_set_text(s_reference_bold_layer, "Proverbs 14:29 -");
  text_layer_set_font(s_reference_bold_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_reference_bold_layer, GTextAlignmentRight);
  layer_add_child(window_layer, text_layer_get_layer(s_reference_bold_layer));

  // Create reference part layer - regular (e.g., " 1/5")
  s_reference_part_layer = text_layer_create(GRect(110, 147, 34, 18));
  text_layer_set_background_color(s_reference_part_layer, GColorClear);
  text_layer_set_text_color(s_reference_part_layer, GColorBlack);
  text_layer_set_text(s_reference_part_layer, " 1/5");
  text_layer_set_font(s_reference_part_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(s_reference_part_layer, GTextAlignmentLeft);
  layer_add_child(window_layer, text_layer_get_layer(s_reference_part_layer));
}

static void prv_window_unload(Window *window) {
  text_layer_destroy(s_time_layer);
  text_layer_destroy(s_ampm_layer);
  text_layer_destroy(s_ampm_layer2);
  text_layer_destroy(s_date_info_layer);
  text_layer_destroy(s_scripture_layer);
  text_layer_destroy(s_reference_bold_layer);
  text_layer_destroy(s_reference_part_layer);
  layer_destroy(s_border_layer);
  layer_destroy(s_separator_layer1);
  layer_destroy(s_separator_layer2);
}

static void prv_init(void) {
  s_window = window_create();
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = prv_window_load,
    .unload = prv_window_unload,
  });
  const bool animated = true;
  window_stack_push(s_window, animated);

  // Register with TickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, prv_tick_handler);

  // Make sure the time and date are displayed from the start
  prv_update_time();
  prv_update_date();
}

static void prv_deinit(void) {
  window_destroy(s_window);
}

int main(void) {
  prv_init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", s_window);

  app_event_loop();
  prv_deinit();
}

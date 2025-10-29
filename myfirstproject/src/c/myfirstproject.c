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

// Buffer to store current temperature
static char s_temp_buffer[8] = "N/A";

// Buffers to store scripture data
static char s_scripture_text[128] = "Whoever is patient has great understanding, but one who is quick-tempered displays folly.";
static char s_scripture_ref[32] = "Prov 14:29";
static char s_scripture_part[8] = "1/1";

// Shake to advance setting
static bool s_shake_enabled = true;  // Default: enabled

// Manual navigation state
static bool s_manual_mode = false;
static AppTimer *s_manual_mode_timer = NULL;

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
  
  // Combine everything into one line with current temperature
  snprintf(date_info_buffer, sizeof(date_info_buffer), "%s the %d%s at %s", 
           day_buffer, day, suffix, s_temp_buffer);
  text_layer_set_text(s_date_info_layer, date_info_buffer);
}

static void prv_tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  prv_update_time();
  
  // Update date once per day (or on startup)
  if (units_changed & DAY_UNIT) {
    prv_update_date();
  }
}

// Handle incoming messages from JavaScript
static void prv_inbox_received_handler(DictionaryIterator *iter, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "AppMessage received");
  
  // Check for weather temperature
  Tuple *temp_tuple = dict_find(iter, MESSAGE_KEY_WEATHER_TEMP);
  if (temp_tuple) {
    snprintf(s_temp_buffer, sizeof(s_temp_buffer), "%s", temp_tuple->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Received temperature: %s", s_temp_buffer);
    prv_update_date(); // Refresh the date line with new temperature
  }
  
  // Check for scripture text
  Tuple *scripture_tuple = dict_find(iter, MESSAGE_KEY_SCRIPTURE_TEXT);
  if (scripture_tuple) {
    snprintf(s_scripture_text, sizeof(s_scripture_text), "%s", scripture_tuple->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Received scripture text: %s", s_scripture_text);
    text_layer_set_text(s_scripture_layer, s_scripture_text);
  }
  
  // Check for scripture reference
  Tuple *ref_tuple = dict_find(iter, MESSAGE_KEY_SCRIPTURE_REF);
  if (ref_tuple) {
    snprintf(s_scripture_ref, sizeof(s_scripture_ref), "%s", ref_tuple->value->cstring);
    APP_LOG(APP_LOG_LEVEL_INFO, "Received scripture reference: %s", s_scripture_ref);
    text_layer_set_text(s_reference_bold_layer, s_scripture_ref);
  }
  
  // Check for scripture part numbers
  Tuple *part_current_tuple = dict_find(iter, MESSAGE_KEY_SCRIPTURE_PART_CURRENT);
  Tuple *part_total_tuple = dict_find(iter, MESSAGE_KEY_SCRIPTURE_PART_TOTAL);
  if (part_current_tuple && part_total_tuple) {
    snprintf(s_scripture_part, sizeof(s_scripture_part), "%d/%d", 
             (int)part_current_tuple->value->int32,
             (int)part_total_tuple->value->int32);
    APP_LOG(APP_LOG_LEVEL_INFO, "Received scripture part: %s", s_scripture_part);
    text_layer_set_text(s_reference_part_layer, s_scripture_part);
  }
  
  // Check for shake enabled setting
  Tuple *shake_tuple = dict_find(iter, MESSAGE_KEY_ENABLE_SHAKE);
  if (shake_tuple) {
    s_shake_enabled = shake_tuple->value->int32 == 1;
    APP_LOG(APP_LOG_LEVEL_INFO, "Shake enabled setting: %s", s_shake_enabled ? "true" : "false");
  }
}

static void prv_inbox_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "AppMessage dropped! Reason: %d", (int)reason);
}

static void prv_outbox_failed_handler(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "AppMessage outbox failed! Reason: %d", (int)reason);
}

static void prv_outbox_sent_handler(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "AppMessage sent successfully");
}

// Timer callback to exit manual mode
static void prv_exit_manual_mode(void *data) {
  s_manual_mode = false;
  s_manual_mode_timer = NULL;
  APP_LOG(APP_LOG_LEVEL_INFO, "Exited manual mode, returning to auto-rotation");
}

// Request next scripture chunk from JavaScript
static void prv_request_next_chunk(void) {
  // Send a message to JS to advance to next chunk
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  
  if (iter == NULL) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Failed to create outbox iterator");
    return;
  }
  
  // Send a request for next chunk
  dict_write_uint8(iter, MESSAGE_KEY_REQUEST_NEXT_CHUNK, 1);
  
  app_message_outbox_send();
  APP_LOG(APP_LOG_LEVEL_INFO, "Requested next scripture chunk");
}

// Shake/tap handler
static void prv_tap_handler(AccelAxisType axis, int32_t direction) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Shake detected!");
  
  // Check if shake is enabled
  if (!s_shake_enabled) {
    APP_LOG(APP_LOG_LEVEL_INFO, "Shake disabled - ignoring");
    return;
  }
  
  // Enter manual mode
  s_manual_mode = true;
  
  // Cancel existing timer if any
  if (s_manual_mode_timer) {
    app_timer_cancel(s_manual_mode_timer);
  }
  
  // Set timer to exit manual mode after 2 minutes (120000 ms)
  s_manual_mode_timer = app_timer_register(120000, prv_exit_manual_mode, NULL);
  
  // Request next chunk from JavaScript
  prv_request_next_chunk();
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
  text_layer_set_text(s_scripture_layer, s_scripture_text);
  text_layer_set_font(s_scripture_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(s_scripture_layer, GTextAlignmentCenter);
  text_layer_set_overflow_mode(s_scripture_layer, GTextOverflowModeTrailingEllipsis);
  layer_add_child(window_layer, text_layer_get_layer(s_scripture_layer));

  // Create reference layer - bold part (e.g., "John 15:9-17")
  s_reference_bold_layer = text_layer_create(GRect(4, 147, 100, 18));
  text_layer_set_background_color(s_reference_bold_layer, GColorClear);
  text_layer_set_text_color(s_reference_bold_layer, GColorBlack);
  text_layer_set_text(s_reference_bold_layer, s_scripture_ref);
  text_layer_set_font(s_reference_bold_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_reference_bold_layer, GTextAlignmentLeft);
  layer_add_child(window_layer, text_layer_get_layer(s_reference_bold_layer));

  // Create reference part layer - regular (e.g., "1/8")
  s_reference_part_layer = text_layer_create(GRect(bounds.size.w - 38, 147, 34, 18));
  text_layer_set_background_color(s_reference_part_layer, GColorClear);
  text_layer_set_text_color(s_reference_part_layer, GColorBlack);
  text_layer_set_text(s_reference_part_layer, s_scripture_part);
  text_layer_set_font(s_reference_part_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
  text_layer_set_text_alignment(s_reference_part_layer, GTextAlignmentRight);
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
  
  // Register AppMessage handlers
  app_message_register_inbox_received(prv_inbox_received_handler);
  app_message_register_inbox_dropped(prv_inbox_dropped_handler);
  app_message_register_outbox_failed(prv_outbox_failed_handler);
  app_message_register_outbox_sent(prv_outbox_sent_handler);
  
  // Open AppMessage connection with larger buffers for scripture text
  app_message_open(256, 256);
  
  // Subscribe to tap service for shake detection
  accel_tap_service_subscribe(prv_tap_handler);
}

static void prv_deinit(void) {
  // Unsubscribe from tap service
  accel_tap_service_unsubscribe();
  
  // Cancel manual mode timer if active
  if (s_manual_mode_timer) {
    app_timer_cancel(s_manual_mode_timer);
  }
  
  window_destroy(s_window);
}

int main(void) {
  prv_init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", s_window);

  app_event_loop();
  prv_deinit();
}

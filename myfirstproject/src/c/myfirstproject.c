#include <pebble.h>

static Window *s_window;
static TextLayer *s_time_layer;
static TextLayer *s_ampm_layer;
static TextLayer *s_ampm_layer2;
static Layer *s_border_layer;

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

static void prv_tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  prv_update_time();
}

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  // Create border layer
  s_border_layer = layer_create(bounds);
  layer_set_update_proc(s_border_layer, prv_border_draw);
  layer_add_child(window_layer, s_border_layer);

  // Create the TextLayer with specific bounds
  s_time_layer = text_layer_create(
      GRect(5, 10, bounds.size.w - 25, 50));

  // Improve the layout to be more like a watchface
  text_layer_set_background_color(s_time_layer, GColorClear);
  text_layer_set_text_color(s_time_layer, GColorBlack);
  text_layer_set_text(s_time_layer, "00:00");
  text_layer_set_font(s_time_layer, fonts_get_system_font(FONT_KEY_LECO_42_NUMBERS));
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentLeft);

  // Add it as a child layer to the Window's root layer
  layer_add_child(window_layer, text_layer_get_layer(s_time_layer));

  // Create the TextLayer for AM/PM (first letter)
  s_ampm_layer = text_layer_create(GRect(bounds.size.w - 20, 18, 15, 25));
  text_layer_set_background_color(s_ampm_layer, GColorClear);
  text_layer_set_text_color(s_ampm_layer, GColorBlack);
  text_layer_set_text(s_ampm_layer, "");
  text_layer_set_font(s_ampm_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_ampm_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_ampm_layer));

  // Create the TextLayer for AM/PM (second letter)
  s_ampm_layer2 = text_layer_create(GRect(bounds.size.w - 20, 38, 15, 25));
  text_layer_set_background_color(s_ampm_layer2, GColorClear);
  text_layer_set_text_color(s_ampm_layer2, GColorBlack);
  text_layer_set_text(s_ampm_layer2, "");
  text_layer_set_font(s_ampm_layer2, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text_alignment(s_ampm_layer2, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_ampm_layer2));
}

static void prv_window_unload(Window *window) {
  text_layer_destroy(s_time_layer);
  text_layer_destroy(s_ampm_layer);
  text_layer_destroy(s_ampm_layer2);
  layer_destroy(s_border_layer);
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

  // Make sure the time is displayed from the start
  prv_update_time();
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

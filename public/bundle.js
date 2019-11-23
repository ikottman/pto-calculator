
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, props) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : prop_values;
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const selectedDays = writable([]);

    /* src/components/calendar/Day.svelte generated by Svelte v3.13.0 */
    const file = "src/components/calendar/Day.svelte";

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.label);
    			attr_dev(div, "id", ctx.id);
    			attr_dev(div, "class", "svelte-q2rrc8");
    			toggle_class(div, "selected", ctx.selected);
    			toggle_class(div, "unselected", ctx.unselected);
    			add_location(div, file, 59, 0, 1132);
    			dispose = listen_dev(div, "click", ctx.onClick, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(changed, ctx) {
    			if (changed.label) set_data_dev(t, ctx.label);

    			if (changed.selected) {
    				toggle_class(div, "selected", ctx.selected);
    			}

    			if (changed.unselected) {
    				toggle_class(div, "unselected", ctx.unselected);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $selectedDays;
    	validate_store(selectedDays, "selectedDays");
    	component_subscribe($$self, selectedDays, $$value => $$invalidate("$selectedDays", $selectedDays = $$value));
    	let { label } = $$props;
    	let { date } = $$props;

    	function onClick() {
    		if (!date) {
    			return;
    		}

    		if ($selectedDays.includes(date)) {
    			selectedDays.update(existing => $selectedDays.filter(d => d !== date));
    		} else {
    			selectedDays.update(existing => [...existing, date]);
    		}
    	}

    	let id = !!date ? "day" : "header";
    	const writable_props = ["label", "date"];

    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith("$$")) console.warn(`<Day> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("date" in $$props) $$invalidate("date", date = $$props.date);
    	};

    	$$self.$capture_state = () => {
    		return {
    			label,
    			date,
    			id,
    			$selectedDays,
    			selected,
    			unselected
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("date" in $$props) $$invalidate("date", date = $$props.date);
    		if ("id" in $$props) $$invalidate("id", id = $$props.id);
    		if ("$selectedDays" in $$props) selectedDays.set($selectedDays = $$props.$selectedDays);
    		if ("selected" in $$props) $$invalidate("selected", selected = $$props.selected);
    		if ("unselected" in $$props) $$invalidate("unselected", unselected = $$props.unselected);
    	};

    	let selected;
    	let unselected;

    	$$self.$$.update = (changed = { date: 1, $selectedDays: 1, selected: 1 }) => {
    		if (changed.date || changed.$selectedDays) {
    			 $$invalidate("selected", selected = date
    			? $selectedDays.some(selectedDay => selectedDay.getTime() === date.getTime())
    			: false);
    		}

    		if (changed.selected) {
    			 $$invalidate("unselected", unselected = !selected);
    		}
    	};

    	return {
    		label,
    		date,
    		onClick,
    		id,
    		selected,
    		unselected
    	};
    }

    class Day extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { label: 0, date: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Day",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (ctx.label === undefined && !("label" in props)) {
    			console.warn("<Day> was created without expected prop 'label'");
    		}

    		if (ctx.date === undefined && !("date" in props)) {
    			console.warn("<Day> was created without expected prop 'date'");
    		}
    	}

    	get label() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/calendar/Month.svelte generated by Svelte v3.13.0 */
    const file$1 = "src/components/calendar/Month.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.day = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.week = list[i];
    	return child_ctx;
    }

    // (55:6) {#each week as day}
    function create_each_block_1(ctx) {
    	let current;

    	const day_1 = new Day({
    			props: { label: ctx.day.label, date: ctx.day.date },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(day_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(day_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(day_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(day_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(day_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(55:6) {#each week as day}",
    		ctx
    	});

    	return block;
    }

    // (54:2) {#each month as week}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = ctx.week;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (changed.month) {
    				each_value_1 = ctx.week;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:2) {#each month as week}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let current;
    	let each_value = ctx.month;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(ctx.name);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-y931n4");
    			add_location(h2, file$1, 52, 2, 1098);
    			attr_dev(div, "class", "container svelte-y931n4");
    			add_location(div, file$1, 51, 0, 1072);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (!current || changed.name) set_data_dev(t0, ctx.name);

    			if (changed.month) {
    				each_value = ctx.month;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function day(month, dayNum) {
    	const date = new Date(month.getFullYear(), month.getMonth(), dayNum);
    	return { label: dayNum, date };
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { days } = $$props;
    	let { firstDay } = $$props;
    	let { date } = $$props;
    	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    	let dayIndex = weekdays.findIndex(d => d === firstDay);
    	const fillerDay = { label: "" };
    	let week = Array(dayIndex).fill(fillerDay);

    	const header = weekdays.map(day => {
    		return { label: day[0] };
    	});

    	const month = [header];

    	for (let i = 1; i <= days; i++) {
    		week.push(day(date, i));

    		if (dayIndex == 6 || i == days) {
    			dayIndex = 0;
    			month.push(week);
    			week = [];
    		} else {
    			dayIndex++;
    		}
    	}

    	const writable_props = ["name", "days", "firstDay", "date"];

    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith("$$")) console.warn(`<Month> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate("name", name = $$props.name);
    		if ("days" in $$props) $$invalidate("days", days = $$props.days);
    		if ("firstDay" in $$props) $$invalidate("firstDay", firstDay = $$props.firstDay);
    		if ("date" in $$props) $$invalidate("date", date = $$props.date);
    	};

    	$$self.$capture_state = () => {
    		return {
    			name,
    			days,
    			firstDay,
    			date,
    			dayIndex,
    			week
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate("name", name = $$props.name);
    		if ("days" in $$props) $$invalidate("days", days = $$props.days);
    		if ("firstDay" in $$props) $$invalidate("firstDay", firstDay = $$props.firstDay);
    		if ("date" in $$props) $$invalidate("date", date = $$props.date);
    		if ("dayIndex" in $$props) dayIndex = $$props.dayIndex;
    		if ("week" in $$props) week = $$props.week;
    	};

    	return { name, days, firstDay, date, month };
    }

    class Month extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0, days: 0, firstDay: 0, date: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Month",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (ctx.name === undefined && !("name" in props)) {
    			console.warn("<Month> was created without expected prop 'name'");
    		}

    		if (ctx.days === undefined && !("days" in props)) {
    			console.warn("<Month> was created without expected prop 'days'");
    		}

    		if (ctx.firstDay === undefined && !("firstDay" in props)) {
    			console.warn("<Month> was created without expected prop 'firstDay'");
    		}

    		if (ctx.date === undefined && !("date" in props)) {
    			console.warn("<Month> was created without expected prop 'date'");
    		}
    	}

    	get name() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get days() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set days(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstDay() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstDay(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/calendar/Calendar.svelte generated by Svelte v3.13.0 */
    const file$2 = "src/components/calendar/Calendar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.month = list[i];
    	return child_ctx;
    }

    // (33:2) {#each dates as month}
    function create_each_block$1(ctx) {
    	let current;

    	const month = new Month({
    			props: {
    				name: ctx.month.getFullMonth(),
    				days: ctx.month.daysInMonth(),
    				firstDay: ctx.month.getFullDay(),
    				date: ctx.month
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(month.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(month, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(month.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(month.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(month, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(33:2) {#each dates as month}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = ctx.dates;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-r4hx83");
    			add_location(div, file$2, 31, 0, 818);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (changed.dates) {
    				each_value = ctx.dates;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self) {
    	Date.prototype.daysInMonth = function () {
    		let date = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    		return date.getDate();
    	};

    	Date.prototype.getFullMonth = function () {
    		return this.toLocaleString("default", { month: "long" });
    	};

    	Date.prototype.getFullDay = function () {
    		return this.toLocaleString("default", { weekday: "long" });
    	};

    	const currentYear = new Date().getFullYear();
    	const dates = Array(12).fill(0).map((_, index) => new Date(currentYear, index));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return { dates };
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/PtoCalculator.svelte generated by Svelte v3.13.0 */
    const file$3 = "src/components/PtoCalculator.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let input0;
    	let input0_updating = false;
    	let t4;
    	let input1;
    	let input1_updating = false;
    	let t5;
    	let span2;
    	let t7;
    	let span3;
    	let t9;
    	let span4;
    	let t10_value = ctx.$selectedDays.length + "";
    	let t10;
    	let t11;
    	let span5;
    	let t12;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		ctx.input0_input_handler.call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		ctx.input1_input_handler.call(input1);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Weekly Accrual Rate";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Starting PTO (hours):";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "Planned PTO (hours):";
    			t7 = space();
    			span3 = element("span");
    			span3.textContent = "End of Year Balance (hours):";
    			t9 = space();
    			span4 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			span5 = element("span");
    			t12 = text(ctx.predicted);
    			add_location(span0, file$3, 48, 2, 1016);
    			add_location(span1, file$3, 49, 2, 1052);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "step", "0.0001");
    			attr_dev(input0, "min", "0");
    			add_location(input0, file$3, 50, 2, 1089);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			add_location(input1, file$3, 51, 2, 1151);
    			add_location(span2, file$3, 52, 2, 1201);
    			add_location(span3, file$3, 53, 2, 1237);
    			add_location(span4, file$3, 54, 2, 1281);
    			add_location(span5, file$3, 55, 2, 1319);
    			attr_dev(div, "class", "container svelte-jt56ls");
    			add_location(div, file$3, 47, 0, 990);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(div, t3);
    			append_dev(div, input0);
    			set_input_value(input0, ctx.velocity);
    			append_dev(div, t4);
    			append_dev(div, input1);
    			set_input_value(input1, ctx.starting);
    			append_dev(div, t5);
    			append_dev(div, span2);
    			append_dev(div, t7);
    			append_dev(div, span3);
    			append_dev(div, t9);
    			append_dev(div, span4);
    			append_dev(span4, t10);
    			append_dev(div, t11);
    			append_dev(div, span5);
    			append_dev(span5, t12);
    		},
    		p: function update(changed, ctx) {
    			if (!input0_updating && changed.velocity) {
    				set_input_value(input0, ctx.velocity);
    			}

    			input0_updating = false;

    			if (!input1_updating && changed.starting) {
    				set_input_value(input1, ctx.starting);
    			}

    			input1_updating = false;
    			if (changed.$selectedDays && t10_value !== (t10_value = ctx.$selectedDays.length + "")) set_data_dev(t10, t10_value);
    			if (changed.predicted) set_data_dev(t12, ctx.predicted);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isSunday(date) {
    	return date.getDay() === 0;
    }

    function incrementDay(date) {
    	date.setDate(date.getDate() + 1);
    }

    function weeksBetweenDates(start, end) {
    	let date = new Date(start.getTime());
    	let numSundays = 0;

    	do {
    		incrementDay(date);

    		if (isSunday(date)) {
    			numSundays++;
    		}
    	} while (date.getTime() < end.getTime());

    	return numSundays;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedDays;
    	validate_store(selectedDays, "selectedDays");
    	component_subscribe($$self, selectedDays, $$value => $$invalidate("$selectedDays", $selectedDays = $$value));
    	let starting = 0;
    	let velocity = 0;
    	let today = new Date();
    	let nextYear = new Date(today.getFullYear() + 1, 0, 1);

    	function input0_input_handler() {
    		velocity = to_number(this.value);
    		$$invalidate("velocity", velocity);
    	}

    	function input1_input_handler() {
    		starting = to_number(this.value);
    		$$invalidate("starting", starting);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("starting" in $$props) $$invalidate("starting", starting = $$props.starting);
    		if ("velocity" in $$props) $$invalidate("velocity", velocity = $$props.velocity);
    		if ("today" in $$props) $$invalidate("today", today = $$props.today);
    		if ("nextYear" in $$props) $$invalidate("nextYear", nextYear = $$props.nextYear);
    		if ("plannedPto" in $$props) $$invalidate("plannedPto", plannedPto = $$props.plannedPto);
    		if ("$selectedDays" in $$props) selectedDays.set($selectedDays = $$props.$selectedDays);
    		if ("gainedPto" in $$props) $$invalidate("gainedPto", gainedPto = $$props.gainedPto);
    		if ("predicted" in $$props) $$invalidate("predicted", predicted = $$props.predicted);
    	};

    	let plannedPto;
    	let gainedPto;
    	let predicted;

    	$$self.$$.update = (changed = { $selectedDays: 1, today: 1, nextYear: 1, velocity: 1, starting: 1, gainedPto: 1, plannedPto: 1 }) => {
    		if (changed.$selectedDays) {
    			 $$invalidate("plannedPto", plannedPto = $selectedDays.length * 8);
    		}

    		if (changed.today || changed.nextYear || changed.velocity) {
    			 $$invalidate("gainedPto", gainedPto = weeksBetweenDates(today, nextYear) * velocity);
    		}

    		if (changed.starting || changed.gainedPto || changed.plannedPto) {
    			 $$invalidate("predicted", predicted = Math.floor(starting + gainedPto - plannedPto));
    		}
    	};

    	return {
    		starting,
    		velocity,
    		$selectedDays,
    		predicted,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class PtoCalculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PtoCalculator",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.13.0 */

    function create_fragment$4(ctx) {
    	let t;
    	let current;
    	const ptocalculator = new PtoCalculator({ $$inline: true });
    	const calendar = new Calendar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(ptocalculator.$$.fragment);
    			t = space();
    			create_component(calendar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(ptocalculator, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(calendar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ptocalculator.$$.fragment, local);
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ptocalculator.$$.fragment, local);
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ptocalculator, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(calendar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
